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

  // Always return safe, minimal tournament data
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
            _count: { 
              reviews: 3 
            },
            reviews: [
              { 
                id: '1',
                overall_rating: 4.5
              },
              { 
                id: '2', 
                overall_rating: 5.0
              },
              { 
                id: '3',
                overall_rating: 4.0
              }
            ]
          },
          {
            id: '2',
            name: 'Fall Championship Series',
            location: 'Phoenix, AZ',
            description: 'Competitive fall tournament series',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            _count: { 
              reviews: 3 
            },
            reviews: [
              { 
                id: '4',
                overall_rating: 4.8
              },
              { 
                id: '5',
                overall_rating: 4.2
              },
              { 
                id: '6',
                overall_rating: 4.6
              }
            ]
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

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}