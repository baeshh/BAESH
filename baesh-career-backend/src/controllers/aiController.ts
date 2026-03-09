import { Response } from 'express';
import OpenAI from 'openai';
import { AuthRequest } from '../middleware/auth';

const openai = new OpenAI({
  apiKey: process.env.UPSTAGE_API_KEY || '',
  baseURL: process.env.UPSTAGE_BASE_URL || 'https://api.upstage.ai/v1'
});

export const chatWithReasoning = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { messages, reasoningEffort = 'high' } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Messages array required' });
      return;
    }

    const completion = await openai.chat.completions.create({
      model: 'solar-pro3',
      messages,
      reasoning_effort: reasoningEffort || 'medium',
      temperature: 0.8,
      max_tokens: 65536,
      stream: false
    } as any);

    res.json({
      content: completion.choices[0].message.content || ''
    });
  } catch (error: any) {
    console.error('AI API error:', error);
    res.status(500).json({ error: 'AI service error', details: error.message });
  }
};

export const streamChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { messages, reasoningEffort } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Messages array required' });
      return;
    }

    // SSE 헤더 설정
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Nginx 버퍼링 방지

    const stream = await openai.chat.completions.create({
      model: 'solar-pro3',
      messages,
      reasoning_effort: reasoningEffort || 'medium',
      temperature: 0.8,
      max_tokens: 65536,
      stream: true
    } as any) as any;

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('AI Stream error:', error);
    res.write(`data: ${JSON.stringify({ error: 'AI service error', details: error.message })}\n\n`);
    res.end();
  }
};


