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

  // Return extremely simple data to test
  if (req.method === 'GET') {
    const simpleData = {
      success: true,
      data: {
        tournaments: [
          {
            id: '1',
            name: 'Test Tournament',
            location: 'Test City',
            description: 'Test Description',
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-01T00:00:00.000Z',
            _count: { reviews: 1 },
            reviews: [
              {
                id: '1',
                tournamentId: '1',
                userId: null,
                overall_rating: 4.0,
                coaching_rating: 4.0,
                value_rating: 4.0,
                organization_rating: 4.0,
                playing_time_rating: 4.0,
                comment: 'Test review',
                createdAt: '2025-01-01T00:00:00.000Z',
                updatedAt: '2025-01-01T00:00:00.000Z'
              }
            ]
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1
        }
      },
      message: 'Debug tournaments retrieved'
    };

    console.log('Debug tournament data:', JSON.stringify(simpleData, null, 2));
    return res.status(200).json(simpleData);
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}