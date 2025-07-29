import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from '../src/routes/auth';
import teamRoutes from '../src/routes/teams';
import reviewRoutes from '../src/routes/reviews';
import tournamentRoutes from '../src/routes/tournaments';
import tournamentReviewRoutes from '../src/routes/tournamentReviews';
import adminRoutes from '../src/routes/admin';
import chatRoutes from '../src/routes/chat';

// Import middleware
import { errorHandler } from '../src/middleware/errorHandler';

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Travel Baseball Reviews API', 
    status: 'OK',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      teams: '/api/teams',
      tournaments: '/api/tournaments', 
      reviews: '/api/reviews',
      auth: '/api/auth',
      admin: '/api/admin'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/tournament-reviews', tournamentReviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    path: req.originalUrl
  });
});

export default app;