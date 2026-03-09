import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { z } from 'zod';

const createSessionSchema = z.object({
  title: z.string().min(1),
  mode: z.string().optional(),
});

const updateSessionSchema = z.object({
  title: z.string().min(1).optional(),
  summary: z.string().optional(),
  messages: z.array(z.object({
    role: z.string(),
    text: z.string(),
    timestamp: z.string().optional(),
  })).optional(),
});

export const getSessions = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const sessions = await prisma.chatSession.findMany({
      where: { userId: req.userId },
      orderBy: { updatedAt: 'desc' },
      take: 50, // 최대 50개
    });

    res.json({
      sessions: sessions.map(session => ({
        id: session.id,
        title: session.title,
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString(),
        messages: (session.messages as any[]) || [],
        summary: session.summary || undefined,
      }))
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
};

export const getSession = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    const session = await prisma.chatSession.findFirst({
      where: {
        id,
        userId: req.userId,
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      id: session.id,
      title: session.title,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      messages: (session.messages as any[]) || [],
      summary: session.summary || undefined,
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
};

export const createSession = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title, mode } = createSessionSchema.parse(req.body);

    const session = await prisma.chatSession.create({
      data: {
        userId: req.userId,
        title,
        mode: mode || null,
        messages: [],
      }
    });

    res.status(201).json({
      id: session.id,
      title: session.title,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      messages: [],
      summary: undefined,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
};

export const updateSession = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const data = updateSessionSchema.parse(req.body);

    // 세션이 존재하고 사용자가 소유자인지 확인
    const existingSession = await prisma.chatSession.findFirst({
      where: {
        id,
        userId: req.userId,
      }
    });

    if (!existingSession) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = await prisma.chatSession.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.summary !== undefined && { summary: data.summary }),
        ...(data.messages !== undefined && { messages: data.messages }),
      }
    });

    res.json({
      id: session.id,
      title: session.title,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      messages: (session.messages as any[]) || [],
      summary: session.summary || undefined,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update session error:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
};

export const deleteSession = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    // 세션이 존재하고 사용자가 소유자인지 확인
    const existingSession = await prisma.chatSession.findFirst({
      where: {
        id,
        userId: req.userId,
      }
    });

    if (!existingSession) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await prisma.chatSession.delete({
      where: { id }
    });

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
};
