import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../utils/prisma';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = signupSchema.parse(req.body);

    // 중복 이메일 체크
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(400).json({ error: 'Email already exists' });
      return;
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    });

    // JWT 토큰 생성
    const jwtSecret: string = process.env.JWT_SECRET || 'fallback-secret';
    const expiresIn: string = process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign(
      { userId: user.id },
      jwtSecret,
      { expiresIn } as jwt.SignOptions
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    console.error('Signup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Signup failed', details: errorMessage });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // JWT 토큰 생성
    const jwtSecret: string = process.env.JWT_SECRET || 'fallback-secret';
    const expiresIn: string = process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign(
      { userId: user.id },
      jwtSecret,
      { expiresIn } as jwt.SignOptions
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const forgotPassword = async (_req: Request, res: Response) => {
  // TODO: 실제 비밀번호 재설정 로직 구현
  res.json({ message: 'Password reset email sent (not implemented)' });
};

export const resetPassword = async (_req: Request, res: Response) => {
  // TODO: 실제 비밀번호 재설정 로직 구현
  res.json({ message: 'Password reset (not implemented)' });
};


