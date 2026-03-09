import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { z } from 'zod';
import { calculateSkills } from '../utils/skillCalculator';

const updateProfileSchema = z.object({
  nickname: z.string().optional(),
  school: z.string().optional(),
  major: z.string().optional(),
  status: z.array(z.string()).optional(),
  skills: z.object({
    development: z.number().min(0).max(100),
    design: z.number().min(0).max(100),
    communication: z.number().min(0).max(100),
  }).optional(),
  interests: z.array(z.string()).optional(),
  goals: z.string().optional(),
  profilePhoto: z.string().optional(),
  coverImage: z.string().optional(),
  headline: z.string().optional(),
  username: z.string().optional(),
});

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        profile: {
          include: {
            credentials: true,
            awards: true,
            careers: true,
            portfolios: true,
            organizations: true,
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 프로필이 없으면 빈 프로필 반환 (자동 생성하지 않음)
    if (!user.profile) {
      return res.json({
        basic: {
          name: user.name,
          nickname: undefined,
          school: undefined,
          major: undefined,
          status: [],
        },
        credentials: [],
        awards: [],
        careers: [],
        portfolios: [],
        organizations: [],
        topSkills: [], // 동적으로 계산된 상위 3개 능력
        interests: [],
        goals: undefined,
      });
    }

    // 사용자 데이터를 기반으로 능력 계산
    const calculatedSkills = calculateSkills({
      credentials: (user.profile as any).credentials || [],
      careers: (user.profile as any).careers || [],
      portfolios: (user.profile as any).portfolios || [],
      awards: (user.profile as any).awards || [],
      organizations: (user.profile as any).organizations || [],
    });

    res.json({
      basic: {
        name: user.name,
        nickname: user.profile.nickname || undefined,
        school: user.profile.school || undefined,
        major: user.profile.major || undefined,
        status: Array.isArray(user.profile.status) ? user.profile.status : (user.profile.status as any) || [],
      },
      credentials: (user.profile as any).credentials || [],
      awards: (user.profile as any).awards || [],
      careers: (user.profile as any).careers || [],
      portfolios: (user.profile as any).portfolios || [],
      organizations: (user.profile as any).organizations || [],
      topSkills: calculatedSkills, // 동적으로 계산된 상위 3개 능력
      interests: Array.isArray(user.profile.interests) ? user.profile.interests : (user.profile.interests as any) || [],
      goals: user.profile.goals || undefined,
      profilePhoto: user.profile.profilePhoto || undefined,
      coverImage: user.profile.coverImage || undefined,
      headline: user.profile.headline || undefined,
      username: user.profile.username || undefined,
      onboardingCompleted: (user.profile as any).onboardingCompleted || false,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

export const getUserProfileById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            credentials: true,
            awards: true,
            careers: true,
            portfolios: true,
            organizations: true,
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 프로필이 없으면 빈 프로필 반환
    if (!user.profile) {
      return res.json({
        basic: {
          name: user.name,
          nickname: undefined,
          school: undefined,
          major: undefined,
          status: [],
        },
        credentials: [],
        awards: [],
        careers: [],
        portfolios: [],
        organizations: [],
        topSkills: [],
        interests: [],
        goals: undefined,
      });
    }

    // 사용자 데이터를 기반으로 능력 계산
    const calculatedSkills = calculateSkills({
      credentials: (user.profile as any).credentials || [],
      careers: (user.profile as any).careers || [],
      portfolios: (user.profile as any).portfolios || [],
      awards: (user.profile as any).awards || [],
      organizations: (user.profile as any).organizations || [],
    });

    res.json({
      basic: {
        name: user.name,
        nickname: user.profile.nickname || undefined,
        school: user.profile.school || undefined,
        major: user.profile.major || undefined,
        status: Array.isArray(user.profile.status) ? user.profile.status : (user.profile.status as any) || [],
      },
      credentials: (user.profile as any).credentials || [],
      awards: (user.profile as any).awards || [],
      careers: (user.profile as any).careers || [],
      portfolios: (user.profile as any).portfolios || [],
      organizations: (user.profile as any).organizations || [],
      topSkills: calculatedSkills,
      interests: Array.isArray(user.profile.interests) ? user.profile.interests : (user.profile.interests as any) || [],
      goals: user.profile.goals || undefined,
      profilePhoto: user.profile.profilePhoto || undefined,
      coverImage: user.profile.coverImage || undefined,
      headline: user.profile.headline || undefined,
      username: user.profile.username || undefined,
    });
  } catch (error) {
    console.error('Get user profile by ID error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { limit = 10, excludeCurrent = true } = req.query;

    const users = await prisma.user.findMany({
      where: excludeCurrent === 'true' ? {
        id: { not: req.userId }
      } : undefined,
      take: Number(limit),
      include: {
        profile: {
          select: {
            school: true,
            major: true,
            status: true,
            interests: true,
          }
        }
      } as any
    });

    res.json({
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        nickname: user.nickname,
        school: (user.profile as any)?.school || undefined,
        major: (user.profile as any)?.major || undefined,
        status: Array.isArray((user.profile as any)?.status) 
          ? (user.profile as any).status 
          : ((user.profile as any)?.status as any) || [],
        interests: Array.isArray((user.profile as any)?.interests)
          ? (user.profile as any).interests
          : ((user.profile as any)?.interests as any) || [],
      }))
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

export const completeOnboarding = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 프로필이 없으면 생성하고 온보딩 완료 표시
    await prisma.userProfile.upsert({
      where: { userId: req.userId },
      update: {
        onboardingCompleted: true,
      },
      create: {
        userId: req.userId,
        onboardingCompleted: true,
        interests: req.body.interests || [],
        goals: req.body.goals || undefined,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const data = updateProfileSchema.parse(req.body);

    // 프로필이 없으면 생성
    const profile = await prisma.userProfile.upsert({
      where: { userId: req.userId },
      update: {
        ...(data.nickname !== undefined && { nickname: data.nickname }),
        ...(data.school !== undefined && { school: data.school }),
        ...(data.major !== undefined && { major: data.major }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.skills !== undefined && { skills: data.skills }),
        ...(data.interests !== undefined && { interests: data.interests }),
        ...(data.goals !== undefined && { goals: data.goals }),
        ...(data.profilePhoto !== undefined && { profilePhoto: data.profilePhoto }),
        ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
        ...(data.headline !== undefined && { headline: data.headline }),
        ...(data.username !== undefined && { username: data.username }),
      },
      create: {
        userId: req.userId,
        nickname: data.nickname,
        school: data.school,
        major: data.major,
        status: data.status || [],
        skills: data.skills || { development: 0, design: 0, communication: 0 },
        interests: data.interests || [],
        goals: data.goals,
        profilePhoto: data.profilePhoto,
        coverImage: data.coverImage,
        headline: data.headline,
        username: data.username,
      },
      include: {
        credentials: true,
        awards: true,
        careers: true,
        portfolios: true,
        organizations: true,
      } as any
    });

    res.json({
      basic: {
        name: (await prisma.user.findUnique({ where: { id: req.userId } }))?.name || '',
        nickname: profile.nickname || undefined,
        school: profile.school || undefined,
        major: profile.major || undefined,
        status: profile.status,
      },
      credentials: (profile as any).credentials || [],
      awards: (profile as any).awards || [],
      careers: (profile as any).careers || [],
      portfolios: (profile as any).portfolios || [],
      organizations: (profile as any).organizations || [],
      skills: profile.skills as { development: number; design: number; communication: number },
      interests: profile.interests,
      goals: profile.goals || undefined,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
