import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { z } from 'zod';
import { extractKeywords, calculateInterestMatch, calculateExposureCount } from '../utils/textAnalyzer';

const createPostSchema = z.object({
  title: z.string().optional().default(''), // 인스타그램 스타일 - 제목 선택사항
  content: z.string().min(1),
  tags: z.array(z.string()).optional(),
  type: z.enum(['lounge', 'networking', 'job']).optional(),
});

export const getPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { type, limit = 50 } = req.query;

    // 현재 사용자의 팔로우 목록 가져오기
    const following = await prisma.follow.findMany({
      where: { followerId: req.userId },
      select: { followingId: true },
    });
    const followingIds = following.map(f => f.followingId);

    // 현재 사용자의 관심사 가져오기
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: req.userId },
      select: { interests: true },
    });
    const userInterests = userProfile && Array.isArray((userProfile.interests as any))
      ? (userProfile.interests as any)
      : [];

    // 모든 게시물 가져오기
    const allPosts = await prisma.post.findMany({
      where: type ? { type: type as string } : undefined,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          }
        },
        comments: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        postLikes: {
          where: {
            userId: req.userId || '',
          },
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            comments: true,
          }
        }
      } as any
    });

    // 게시물에 우선순위 점수 부여 (다양성 고려)
    const postsWithScore = allPosts.map((post: any) => {
      let score = 0;
      const postTags = Array.isArray(post.tags) ? post.tags : (post.tags as any) || [];
      
      // 팔로우한 사람의 게시물: 높은 우선순위 (하지만 다양성을 위해 너무 높지 않게)
      if (followingIds.includes(post.userId)) {
        score += 500; // 기존 1000에서 500으로 감소
      }
      
      // 관심사 기반 점수 계산
      const matchingInterests = postTags.filter((tag: string) =>
        userInterests.some((interest: string) =>
          interest.toLowerCase().includes(tag.toLowerCase()) ||
          tag.toLowerCase().includes(interest.toLowerCase())
        )
      );
      score += matchingInterests.length * 80; // 기존 100에서 80으로 감소
      
      // 좋아요 수 기반 점수 (로그 스케일로 다양성 확보)
      score += Math.log10(post.likes + 1) * 30;
      
      // 댓글 수 기반 점수 (로그 스케일)
      score += Math.log10((post._count?.comments || 0) + 1) * 15;
      
      // 최신 게시물 보너스 (시간 가중치 - 최근일수록 높은 점수)
      const postDate = new Date(post.createdAt);
      const now = new Date();
      const hoursDiff = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60);
      
      // 시간 가중치: 최근 1시간 = 200점, 24시간 = 50점, 그 이후는 감소
      if (hoursDiff < 1) {
        score += 200; // 최신 게시물 강력한 우선순위
      } else if (hoursDiff < 6) {
        score += 150;
      } else if (hoursDiff < 24) {
        score += 100;
      } else if (hoursDiff < 72) {
        score += 50;
      } else {
        score += 20; // 오래된 게시물도 약간의 기회
      }

      return {
        ...post,
        score,
        isFollowing: followingIds.includes(post.userId),
        isRecommended: !followingIds.includes(post.userId) && matchingInterests.length > 0,
        hoursDiff, // 다양성 정렬에 사용
      };
    });

    // 다양성을 고려한 정렬 알고리즘
    const sortedPosts = postsWithScore.sort((a, b) => {
      // 최신 게시물 (1시간 이내)은 항상 우선
      if (a.hoursDiff < 1 && b.hoursDiff >= 1) return -1;
      if (a.hoursDiff >= 1 && b.hoursDiff < 1) return 1;
      
      // 같은 시간대면 점수 순
      return b.score - a.score;
    });

    // 다양성을 위한 필터링: 같은 작성자의 연속 게시물 제한
    const diversifiedPosts: any[] = [];
    const authorCounts = new Map<string, number>();
    const maxPostsPerAuthor = 2; // 같은 작성자 최대 2개

    for (const post of sortedPosts) {
      const authorId = post.userId;
      const count = authorCounts.get(authorId) || 0;
      
      if (count < maxPostsPerAuthor || post.hoursDiff < 1) {
        // 최신 게시물(1시간 이내)이거나 작성자별 제한 내면 추가
        diversifiedPosts.push(post);
        authorCounts.set(authorId, count + 1);
      }
    }

    // 제한된 수만큼 반환 (다양성 필터링 후)
    const limitedPosts = diversifiedPosts.slice(0, Number(limit));

    // 각 게시물에 대한 관심사 매칭률 및 노출 횟수 계산
    const postsWithAnalysis = await Promise.all(
      limitedPosts.map(async (post: any) => {
        const postTags = Array.isArray(post.tags) ? post.tags : (post.tags as any) || [];
        
        // 관심사 매칭률 계산
        const interestMatchRate = calculateInterestMatch(postTags, userInterests);
        
        // 노출 횟수 계산
        const exposureInfo = await calculateExposureCount(postTags, post.type || 'networking');
        
        // 추천 여부 결정 (매칭률이 50% 이상이고 팔로우하지 않은 경우)
        const isRecommended = !post.isFollowing && interestMatchRate >= 50;
        
        return {
          id: post.id,
          author: post.user?.name || 'Unknown',
          authorId: post.user?.id || null,
          verified: false,
          title: post.title,
          content: post.content,
          tags: postTags,
          likes: post.likes,
          comments: post._count?.comments || 0,
          timestamp: post.createdAt.toISOString(),
          type: post.type,
          isFollowing: post.isFollowing,
          isRecommended: isRecommended,
          interestMatchRate: isRecommended ? interestMatchRate : undefined,
          exposureCount: exposureInfo.totalCount,
          exposureDomains: exposureInfo.topDomains,
          isLiked: Array.isArray(post.postLikes) && post.postLikes.length > 0,
        };
      })
    );

    res.json({
      posts: postsWithAnalysis
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to get posts' });
  }
};

export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const data = createPostSchema.parse(req.body);

    // 텍스트에서 자동 해시태그 추출 (태그가 제공되지 않은 경우)
    let finalTags = data.tags || [];
    if (finalTags.length === 0) {
      try {
        const extractedTags = await extractKeywords(data.content);
        // 의미 있는 태그만 사용 (빈 배열이면 태그 없이 저장)
        finalTags = extractedTags.length > 0 ? extractedTags : [];
      } catch (error) {
        console.error('Failed to extract keywords:', error);
        // 에러 시 빈 배열 유지 (태그 없이 저장)
        finalTags = [];
      }
    }

    const post = await prisma.post.create({
      data: {
        userId: req.userId,
        title: data.title,
        content: data.content,
        tags: finalTags,
        type: data.type || 'networking',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          }
        }
      } as any
    });

    // 노출 횟수 계산
    const exposureInfo = await calculateExposureCount(finalTags, data.type || 'networking');

    res.status(201).json({
      id: post.id,
      author: (post as any).user?.name || 'Unknown',
      authorId: (post as any).user?.id || null,
      verified: false,
      title: post.title,
      content: post.content,
      tags: Array.isArray(post.tags) ? post.tags : (post.tags as any) || [],
      likes: post.likes,
      comments: 0,
      timestamp: post.createdAt.toISOString(),
      exposureCount: exposureInfo.totalCount,
      exposureDomains: exposureInfo.topDomains,
      isLiked: false, // 새로 작성한 게시물은 좋아요를 누르지 않은 상태
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

export const likePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    // 이미 좋아요를 눌렀는지 확인
    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId: req.userId,
          postId: id,
        },
      },
    });

    if (existingLike) {
      // 좋아요 취소
      await prisma.postLike.delete({
        where: {
          id: existingLike.id,
        },
      });

      const post = await prisma.post.update({
        where: { id },
        data: {
          likes: {
            decrement: 1,
          },
        },
      });

      res.json({ likes: post.likes, isLiked: false });
    } else {
      // 좋아요 추가
      await prisma.postLike.create({
        data: {
          userId: req.userId,
          postId: id,
        },
      });

      const post = await prisma.post.update({
        where: { id },
        data: {
          likes: {
            increment: 1,
          },
        },
      });

      res.json({ likes: post.likes, isLiked: true });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
};

const createCommentSchema = z.object({
  content: z.string().min(1),
});

export const createComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const data = createCommentSchema.parse(req.body);

    // 게시물 존재 확인
    const post = await prisma.post.findUnique({
      where: { id }
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    // 댓글 생성
    const comment = await prisma.comment.create({
      data: {
        postId: id,
        userId: req.userId,
        content: data.content,
      },
      include: {
        post: {
          select: {
            _count: {
              select: {
                comments: true,
              }
            }
          }
        }
      } as any
    });

    // 사용자 정보 가져오기
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
      }
    });

    res.status(201).json({
      id: comment.id,
      author: user?.name || 'Unknown',
      authorId: user?.id || null, // 댓글 작성자 ID 추가
      verified: false, // TODO: 프로필에서 verified 정보 가져오기
      content: comment.content,
      timestamp: comment.createdAt.toISOString(),
      postCommentsCount: (comment.post as any)?._count?.comments || 0,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
};

export const updatePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const data = createPostSchema.partial().parse(req.body);

    // 게시물 존재 확인 및 작성자 확인
    const post = await prisma.post.findUnique({
      where: { id }
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    if (post.userId !== req.userId) {
      res.status(403).json({ error: 'Forbidden: You can only edit your own posts' });
      return;
    }

    // 게시물 수정
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
        ...(data.tags && { tags: data.tags }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          }
        }
      } as any
    });

    res.json({
      id: updatedPost.id,
      author: (updatedPost as any).user?.name || 'Unknown',
      authorId: (updatedPost as any).user?.id || null,
      verified: false,
      title: updatedPost.title,
      content: updatedPost.content,
      tags: Array.isArray(updatedPost.tags) ? updatedPost.tags : (updatedPost.tags as any) || [],
      likes: updatedPost.likes,
      comments: 0,
      timestamp: updatedPost.updatedAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
};

export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    // 게시물 존재 확인 및 작성자 확인
    const post = await prisma.post.findUnique({
      where: { id }
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    if (post.userId !== req.userId) {
      res.status(403).json({ error: 'Forbidden: You can only delete your own posts' });
      return;
    }

    // 게시물 삭제
    await prisma.post.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};

export const getComments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const comments = await prisma.comment.findMany({
      where: { postId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        post: {
          select: {
            userId: true,
          }
        }
      } as any
    });

    // 사용자 정보 가져오기
    const userIds = [...new Set(comments.map((c: any) => c.userId))];
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds }
      },
      select: {
        id: true,
        name: true,
      }
    });

    const userMap = new Map(users.map(u => [u.id, u]));

    res.json({
      comments: comments.map((comment: any) => ({
        id: comment.id,
        author: userMap.get(comment.userId)?.name || 'Unknown',
        authorId: comment.userId, // 댓글 작성자 ID 추가
        verified: false, // TODO: 프로필에서 verified 정보 가져오기
        content: comment.content,
        timestamp: comment.createdAt.toISOString(),
      }))
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to get comments' });
  }
};

// 트렌드 해시태그 가져오기
export const getTrendingHashtags = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { hours = 24, limit = 10, type } = req.query;
    const hoursNum = Number(hours);
    const limitNum = Number(limit);

    // 최근 N시간 이내의 게시물 가져오기
    const since = new Date();
    since.setHours(since.getHours() - hoursNum);

    const posts = await prisma.post.findMany({
      where: {
        ...(type ? { type: type as string } : {}),
        createdAt: {
          gte: since,
        },
      },
      select: {
        tags: true,
      },
    });

    // 태그 카운트
    const tagCounts = new Map<string, number>();
    
    posts.forEach((post: any) => {
      const tags = Array.isArray(post.tags) ? post.tags : (post.tags as any) || [];
      tags.forEach((tag: string) => {
        if (tag && typeof tag === 'string' && tag.trim()) {
          const normalizedTag = tag.trim();
          tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) || 0) + 1);
        }
      });
    });

    // 태그를 사용 빈도순으로 정렬
    const trendingTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limitNum)
      .map(({ tag, count }) => ({
        tag,
        count,
      }));

    res.json({
      hashtags: trendingTags,
      period: `${hoursNum}시간`,
    });
  } catch (error) {
    console.error('Get trending hashtags error:', error);
    res.status(500).json({ error: 'Failed to get trending hashtags' });
  }
};

