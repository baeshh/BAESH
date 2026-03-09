import express from 'express';
import { authenticate } from '../middleware/auth';
import { getProfile, updateProfile, getUserProfileById, getUsers, completeOnboarding } from '../controllers/userController';
import { 
  followUser, 
  unfollowUser, 
  getFollowStatus, 
  getFollowers, 
  getFollowing, 
  getFollowCounts 
} from '../controllers/followController';

const router = express.Router();

router.use(authenticate); // 모든 라우트에 인증 필요

router.get('/', getUsers); // 유저 목록 조회
router.get('/profile', getProfile);
router.get('/:userId/profile', getUserProfileById);
router.put('/profile', updateProfile);
router.post('/onboarding/complete', completeOnboarding); // 온보딩 완료

// 팔로우 관련 라우트
router.post('/:userId/follow', followUser);
router.delete('/:userId/follow', unfollowUser);
router.get('/:userId/follow-status', getFollowStatus);
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);
router.get('/:userId/follow-counts', getFollowCounts);

export default router;


