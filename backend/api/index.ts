export default function handler(req: any, res: any) {
  try {
    // Set CORS headers for frontend
    const allowedOrigin = process.env.FRONTEND_URL || 'https://travel-baseball-reviews-frontend.vercel.app';
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    const url = req.url || '';

    // Root endpoint
    if (url === '/' || url === '') {
      return res.status(200).json({
        message: 'Travel Baseball Reviews API',
        status: 'OK',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        frontend_url: process.env.FRONTEND_URL,
        database_connected: !!process.env.DATABASE_URL,
        endpoints: {
          health: '/health',
          teams: '/api/teams - UNDER MAINTENANCE',
          tournaments: '/api/tournaments - UNDER MAINTENANCE'
        }
      });
    }

    // Health check
    if (url === '/health') {
      return res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production'
      });
    }

    // Temporary maintenance message for API routes
    if (url.startsWith('/api/')) {
      return res.status(503).json({
        message: 'API temporarily under maintenance',
        status: 'maintenance',
        path: url,
        expected_return: 'Soon - fixing deployment issues'
      });
    }

    // 404 for other routes
    return res.status(404).json({
      success: false,
      message: 'Route not found',
      path: url
    });

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}