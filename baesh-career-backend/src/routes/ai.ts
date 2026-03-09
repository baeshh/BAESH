import express from 'express';
import { authenticate } from '../middleware/auth';
import { streamChat, chatWithReasoning } from '../controllers/aiController';

const router = express.Router();

router.use(authenticate); // 모든 라우트에 인증 필요

router.post('/chat', chatWithReasoning);
router.post('/chat/stream', streamChat);

export default router;


