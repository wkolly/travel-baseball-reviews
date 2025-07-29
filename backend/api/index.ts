import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Basic routing
  const { url } = req;
  
  if (url === '/' || url === '') {
    return res.json({
      message: 'Travel Baseball Reviews API',
      status: 'OK',
      version: '1.0.0',
      frontend_url: process.env.FRONTEND_URL,
      database_url: process.env.DATABASE_URL ? 'Connected' : 'Not configured',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/api/health',
        teams: '/api/teams',
        tournaments: '/api/tournaments',
        reviews: '/api/reviews'
      }
    });
  }

  if (url === '/health' || url === '/api/health') {
    return res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  }

  // Temporary response for all API routes
  if (url?.startsWith('/api/')) {
    return res.json({
      message: 'API endpoint temporarily unavailable',
      path: url,
      method: req.method,
      status: 'maintenance'
    });
  }

  // 404 for other routes
  return res.status(404).json({
    success: false,
    message: 'Route not found',
    path: url
  });
}