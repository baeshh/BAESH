import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const createApplicationSchema = z.object({
  jobId: z.string().optional(),
  activityId: z.string().optional(),
  type: z.enum(['job', 'activity']),
  motivation: z.string().optional(),
});

export const getApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // TODO: Application 모델이 없으므로 임시로 빈 배열 반환
    // 나중에 Application 모델 추가 필요
    res.json({ applications: [] });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Failed to get applications' });
  }
};

export const createApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const data = createApplicationSchema.parse(req.body);

    // TODO: Application 모델 추가 후 실제 저장
    // 현재는 세션에 저장하거나 다른 방식으로 관리
    res.status(201).json({
      id: `app_${Date.now()}`,
      userId: req.userId,
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    console.error('Create application error:', error);
    res.status(500).json({ error: 'Failed to create application' });
  }
};

