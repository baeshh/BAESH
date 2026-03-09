import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { z } from 'zod';

const createProjectSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(['contest', 'sideProject', 'startup', 'research', 'hackathon', 'other']),
  startDate: z.string(),
  endDate: z.string().nullable().optional(),
  isOngoing: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  status: z.enum(['idea', 'inProgress', 'completed', 'paused']).default('idea'),
  visibility: z.enum(['public', 'linkShare', 'teamOnly']).default('public'),
});

const updateProjectSchema = createProjectSchema.partial();

// 프로젝트 목록 조회
export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { userId: req.userId },
          {
            teamMembers: {
              some: {
                userId: req.userId
              }
            }
          }
        ]
      },
      include: {
        teamMembers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                nickname: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to get projects' });
  }
};

// 프로젝트 상세 조회
export const getProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        teamMembers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                nickname: true
              }
            }
          }
        },
        milestones: true,
        activityLogs: true,
        tasks: true,
        links: true
      }
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // 권한 확인 (소유자, 팀원, 또는 공개 프로젝트)
    const isOwner = project.userId === req.userId;
    const isMember = project.teamMembers.some(m => m.userId === req.userId);
    const isPublic = project.visibility === 'public';

    if (!isOwner && !isMember && !isPublic) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to get project' });
  }
};

// 프로젝트 생성
export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const data = createProjectSchema.parse(req.body);

    const project = await prisma.project.create({
      data: {
        userId: req.userId,
        title: data.title,
        description: data.description,
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate || null,
        isOngoing: data.isOngoing,
        tags: data.tags as any,
        status: data.status,
        visibility: data.visibility,
        // 소유자를 팀 멤버로 자동 추가
        teamMembers: {
          create: {
            userId: req.userId,
            role: 'development', // 기본 역할
            participationType: 'invited',
            teamRole: 'owner',
            projectRoles: [] as any
          }
        }
      },
      include: {
        teamMembers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                nickname: true
              }
            }
          }
        }
      }
    });

    res.status(201).json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

// 프로젝트 수정
export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { projectId } = req.params;
    const data = updateProjectSchema.parse(req.body);

    // 권한 확인
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        teamMembers: true
      }
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const isOwner = project.userId === req.userId;
    const isAdmin = project.teamMembers.some(
      m => m.userId === req.userId && m.teamRole === 'admin'
    );

    if (!isOwner && !isAdmin) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.startDate !== undefined) updateData.startDate = data.startDate;
    if (data.endDate !== undefined) updateData.endDate = data.endDate;
    if (data.isOngoing !== undefined) updateData.isOngoing = data.isOngoing;
    if (data.tags !== undefined) updateData.tags = data.tags as any;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.visibility !== undefined) updateData.visibility = data.visibility;

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
      include: {
        teamMembers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                nickname: true
              }
            }
          }
        }
      }
    });

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
};

// 프로젝트 삭제
export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // 소유자만 삭제 가능
    if (project.userId !== req.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    await prisma.project.delete({
      where: { id: projectId }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};

// 프로젝트 초대
export const inviteToProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { projectId } = req.params;
    const { userIds, message, role } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      res.status(400).json({ error: 'User IDs are required' });
      return;
    }

    // 권한 확인
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        teamMembers: true
      }
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const isOwner = project.userId === req.userId;
    const isAdmin = project.teamMembers.some(
      m => m.userId === req.userId && m.teamRole === 'admin'
    );

    if (!isOwner && !isAdmin) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // 팀 멤버 추가
    const teamMembers = await Promise.all(
      userIds.map(userId =>
        prisma.projectTeamMember.create({
          data: {
            projectId,
            userId,
            role: role || 'development',
            participationType: 'invited',
            teamRole: 'member',
            projectRoles: [role || 'development'] as any
          }
        })
      )
    );

    // 알림 생성
    await Promise.all(
      userIds.map(userId =>
        prisma.notification.create({
          data: {
            userId,
            type: 'system',
            title: '프로젝트 초대',
            message: `${project.title} 프로젝트에 초대되었습니다.`,
            link: `/projects/${projectId}`,
            metadata: {
              projectId,
              inviterId: req.userId,
              message
            }
          }
        })
      )
    );

    res.json({ success: true, teamMembers });
  } catch (error) {
    console.error('Invite to project error:', error);
    res.status(500).json({ error: 'Failed to invite users' });
  }
};
