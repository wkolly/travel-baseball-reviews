export default function handler(req: any, res: any) {
  // Set CORS headers
  const allowedOrigin = process.env.FRONTEND_URL || 'https://travel-baseball-reviews-frontend.vercel.app';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Simple API response
  return res.status(200).json({
    message: 'Travel Baseball Reviews API',
    status: 'Working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    frontend_url: process.env.FRONTEND_URL,
    database_configured: !!process.env.DATABASE_URL,
    note: 'Backend deployed successfully - CORS configured'
  });
}