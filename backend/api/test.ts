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

    // Simple test response
    res.status(200).json({
      message: 'Travel Baseball Reviews API - Test Endpoint',
      status: 'OK',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      frontend_url: process.env.FRONTEND_URL,
      database_url: process.env.DATABASE_URL ? 'configured' : 'not configured',
      method: req.method,
      url: req.url,
      test: 'This endpoint works without any imports!'
    });

  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}