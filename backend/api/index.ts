export default function handler(req: any, res: any) {
  // Set CORS headers - allow multiple origins
  const allowedOrigins = [
    'https://travelbaseballreview.com',
    'https://www.travelbaseballreview.com',
    'https://travel-baseball-reviews-frontend.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean);
  
  const origin = req.headers.origin;
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.url || '';
  
  // Only handle root API requests, let other files handle their specific routes
  if (url !== '/' && url !== '' && url !== '/api' && !url.includes('favicon')) {
    return res.status(404).json({
      success: false,
      message: 'Endpoint not found',
      url: url
    });
  }

  // Simple API response for root only
  return res.status(200).json({
    message: 'Travel Baseball Reviews API',
    status: 'Working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: url,
    frontend_url: process.env.FRONTEND_URL,
    database_configured: !!process.env.DATABASE_URL,
    note: 'Backend deployed successfully - CORS configured'
  });
}