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

  // For now, return mock data
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      data: {
        tournaments: [
          {
            id: '1',
            name: 'Summer Classic Tournament',
            location: 'Orlando, FL',
            description: 'Premier summer tournament for youth baseball',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            _count: { reviews: 8 }
          },
          {
            id: '2',
            name: 'Fall Championship Series',
            location: 'Phoenix, AZ', 
            description: 'Competitive fall tournament series',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            _count: { reviews: 12 }
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1
        }
      },
      message: 'Tournaments retrieved successfully'
    });
  }

  // Handle POST for creating tournaments
  if (req.method === 'POST') {
    return res.status(200).json({
      success: true,
      data: {
        id: 'new-tournament-id',
        name: req.body?.name || 'New Tournament',
        location: req.body?.location || 'TBD'
      },
      message: 'Tournament created successfully'
    });
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}