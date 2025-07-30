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

  // Handle POST for creating reviews
  if (req.method === 'POST') {
    return res.status(200).json({
      success: true,
      data: {
        id: 'new-review-id',
        overall_rating: req.body?.overall_rating || 5,
        comment: req.body?.comment || '',
        createdAt: new Date().toISOString()
      },
      message: 'Review submitted successfully'
    });
  }

  // Handle GET for fetching reviews
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      data: {
        reviews: [
          {
            id: '1',
            overall_rating: 4,
            coaching_rating: 5,
            value_rating: 4,
            organization_rating: 4,
            playing_time_rating: 3,
            comment: 'Great coaching staff and well organized team.',
            createdAt: new Date().toISOString()
          }
        ]
      },
      message: 'Reviews retrieved successfully'
    });
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}