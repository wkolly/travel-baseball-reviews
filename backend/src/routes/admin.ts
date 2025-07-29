import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminAuth';
import { 
  getPendingTeams, 
  approveTeam, 
  rejectTeam, 
  getAdminStats,
  getUsers,
  getAllTeams,
  getAllTournaments,
  updateTeam,
  deleteTeam,
  updateTournament,
  deleteTournament,
  getAllReviews,
  deleteTeamReview,
  deleteTournamentReview
} from '../controllers/adminController';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Admin routes
router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.get('/teams', getAllTeams);
router.get('/tournaments', getAllTournaments);
router.get('/pending-teams', getPendingTeams);
router.put('/teams/:id/approve', approveTeam);
router.put('/teams/:id/reject', rejectTeam);
router.put('/teams/:id', updateTeam);
router.delete('/teams/:id', deleteTeam);
router.put('/tournaments/:id', updateTournament);
router.delete('/tournaments/:id', deleteTournament);
router.get('/reviews', getAllReviews);
router.delete('/reviews/teams/:id', deleteTeamReview);
router.delete('/reviews/tournaments/:id', deleteTournamentReview);

export default router;