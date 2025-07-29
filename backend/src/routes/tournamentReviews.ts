import { Router } from 'express';
import { createTournamentReview, getTournamentReviews } from '../controllers/tournamentReviewController';

const router = Router();

// Tournament review routes
router.post('/tournaments/:tournamentId', createTournamentReview);
router.get('/tournaments/:tournamentId', getTournamentReviews);

export default router;