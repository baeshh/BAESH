import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getSessions,
  getSession,
  createSession,
  updateSession,
  deleteSession
} from '../controllers/sessionController';

const router = express.Router();

router.use(authenticate); // 모든 라우트에 인증 필요

router.get('/', getSessions);
router.get('/:id', getSession);
router.post('/', createSession);
router.put('/:id', updateSession);
router.delete('/:id', deleteSession);

export default router;


