import { Router } from 'express';
import { 
  createReview, 
  getTeamReviews, 
  updateReview, 
  deleteReview 
} from '../controllers/reviewController';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();

// Team-specific review routes
router.get('/teams/:teamId', getTeamReviews);
router.post('/teams/:teamId', createReview);

// General review routes
router.delete('/:reviewId', authenticateToken, deleteReview);

export default router;