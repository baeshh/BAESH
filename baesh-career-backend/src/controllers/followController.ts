import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

// 팔로우하기
export const followUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { userId } = req.params;

    if (req.userId === userId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // 이미 팔로우 중인지 확인
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.userId,
          followingId: userId,
        },
      },
    });

    if (existingFollow) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // 팔로우 생성
    const follow = await prisma.follow.create({
      data: {
        followerId: req.userId,
        followingId: userId,
      },
    });

    // 알림 생성
    const [followerUser, followingUser] = await Promise.all([
      prisma.user.findUnique({
        where: { id: req.userId },
        select: { name: true },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      }),
    ]);

    if (followerUser) {
      await prisma.notification.create({
        data: {
          userId: userId,
          type: 'system',
          title: '새로운 팔로워',
          message: `${followerUser.name}님이 당신을 팔로우했습니다.`,
          link: `/profile/${req.userId}`,
          metadata: { followerId: req.userId },
        },
      });
    }

    res.json({ success: true, follow });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
};

// 언팔로우하기
export const unfollowUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { userId } = req.params;

    const follow = await prisma.follow.deleteMany({
      where: {
        followerId: req.userId,
        followingId: userId,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
};

// 팔로우 상태 확인
export const getFollowStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { userId } = req.params;

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.userId,
          followingId: userId,
        },
      },
    });

    res.json({ isFollowing: !!follow });
  } catch (error) {
    console.error('Get follow status error:', error);
    res.status(500).json({ error: 'Failed to get follow status' });
  }
};

// 팔로워 목록 조회
export const getFollowers = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { userId } = req.params;
    const targetUserId = userId || req.userId;

    const followers = await prisma.follow.findMany({
      where: {
        followingId: targetUserId,
      },
      include: {
        follower: {
          include: {
            profile: {
              select: {
                school: true,
                major: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      followers: followers.map(f => ({
        id: f.follower.id,
        name: f.follower.name,
        nickname: f.follower.nickname,
        school: (f.follower.profile as any)?.school || undefined,
        major: (f.follower.profile as any)?.major || undefined,
        status: Array.isArray((f.follower.profile as any)?.status)
          ? (f.follower.profile as any).status
          : [],
        createdAt: f.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ error: 'Failed to get followers' });
  }
};

// 팔로잉 목록 조회
export const getFollowing = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { userId } = req.params;
    const targetUserId = userId || req.userId;

    const following = await prisma.follow.findMany({
      where: {
        followerId: targetUserId,
      },
      include: {
        following: {
          include: {
            profile: {
              select: {
                school: true,
                major: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      following: following.map(f => ({
        id: f.following.id,
        name: f.following.name,
        nickname: f.following.nickname,
        school: (f.following.profile as any)?.school || undefined,
        major: (f.following.profile as any)?.major || undefined,
        status: Array.isArray((f.following.profile as any)?.status)
          ? (f.following.profile as any).status
          : [],
        createdAt: f.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'Failed to get following' });
  }
};

// 팔로워/팔로잉 수 조회
export const getFollowCounts = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { userId } = req.params;
    const targetUserId = userId || req.userId;

    const [followersCount, followingCount, isFollowing] = await Promise.all([
      prisma.follow.count({
        where: { followingId: targetUserId },
      }),
      prisma.follow.count({
        where: { followerId: targetUserId },
      }),
      targetUserId !== req.userId
        ? prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: req.userId,
                followingId: targetUserId,
              },
            },
          })
        : null,
    ]);

    res.json({
      followersCount,
      followingCount,
      isFollowing: !!isFollowing,
    });
  } catch (error) {
    console.error('Get follow counts error:', error);
    res.status(500).json({ error: 'Failed to get follow counts' });
  }
};

