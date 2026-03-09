import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// 모든 알림 가져오기
router.get('/', authenticate, getNotifications);

// 알림 읽음 처리
router.patch('/:id/read', authenticate, markAsRead);

// 모든 알림 읽음 처리
router.patch('/read-all', authenticate, markAllAsRead);

export default router;

