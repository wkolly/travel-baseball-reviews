import { Router } from 'express';
import { 
  getChatRooms, 
  getRoomMessages, 
  createMessage 
} from '../controllers/chatController';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();

// Chat room routes
router.get('/rooms', optionalAuth, getChatRooms);
router.get('/rooms/:roomId/messages', optionalAuth, getRoomMessages);
router.post('/rooms/:roomId/messages', authenticateToken, createMessage);

export default router;