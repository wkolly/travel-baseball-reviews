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

  // Only handle GET for stats
  if (req.method === 'GET') {
    console.log('Admin stats request received');
    
    return res.status(200).json({
      success: true,
      data: {
        totalTeams: 2,
        totalTournaments: 1,
        totalUsers: 5,
        totalReviews: 8,
        pendingTeams: 0,
        recentActivity: [
          {
            id: '1',
            type: 'team_review',
            description: 'New review for Atlanta Thunder',
            timestamp: new Date().toISOString()
          },
          {
            id: '2',
            type: 'team_created',
            description: 'Dallas Diamonds team added',
            timestamp: new Date(Date.now() - 86400000).toISOString()
          }
        ]
      },
      message: 'Admin stats retrieved successfully'
    });
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}