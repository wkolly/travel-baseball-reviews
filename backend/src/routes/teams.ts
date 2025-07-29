import { Router } from 'express';
import { 
  createTeam, 
  getTeams, 
  getTeam, 
  updateTeam, 
  deleteTeam 
} from '../controllers/teamController';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes (with optional auth)
router.get('/', optionalAuth, getTeams);
router.get('/:id', optionalAuth, getTeam);

// Protected routes
router.post('/', authenticateToken, createTeam);
router.put('/:id', authenticateToken, updateTeam);
router.delete('/:id', authenticateToken, deleteTeam);

export default router;