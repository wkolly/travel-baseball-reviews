import { Router } from 'express';
import { getTournaments, getTournament, createTournament } from '../controllers/tournamentController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Tournament routes
router.get('/', getTournaments);
router.get('/:id', getTournament);
router.post('/', authenticateToken, createTournament);

export default router;