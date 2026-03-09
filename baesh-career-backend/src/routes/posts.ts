import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getPosts, createPost, likePost, createComment, getComments, updatePost, deletePost, getTrendingHashtags } from '../controllers/postController';

const router = Router();

router.get('/', authenticate, getPosts);
router.get('/trending-hashtags', authenticate, getTrendingHashtags);
router.post('/', authenticate, createPost);
router.put('/:id', authenticate, updatePost);
router.delete('/:id', authenticate, deletePost);
router.post('/:id/like', authenticate, likePost);
router.post('/:id/comments', authenticate, createComment);
router.get('/:id/comments', authenticate, getComments);

export default router;

