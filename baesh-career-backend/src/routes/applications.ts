import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getApplications, createApplication } from '../controllers/applicationController';

const router = Router();

router.get('/', authenticate, getApplications);
router.post('/', authenticate, createApplication);

export default router;

