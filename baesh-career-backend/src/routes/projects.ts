import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  inviteToProject
} from '../controllers/projectController';

const router = Router();

router.get('/', authenticate, getProjects);
router.get('/:projectId', authenticate, getProject);
router.post('/', authenticate, createProject);
router.put('/:projectId', authenticate, updateProject);
router.delete('/:projectId', authenticate, deleteProject);
router.post('/:projectId/invite', authenticate, inviteToProject);

export default router;
