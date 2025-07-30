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

  // Handle GET requests
  if (req.method === 'GET') {
    const { url } = req;
    
    // Check if this is a request for a specific tournament (e.g., /tournaments/1)
    const tournamentIdMatch = url?.match(/\/tournaments\/([^\/]+)/);
    if (tournamentIdMatch) {
      const tournamentId = tournamentIdMatch[1];
      
      // Return single tournament data
      return res.status(200).json({
        success: true,
        data: {
          id: tournamentId,
          name: tournamentId === '1' ? 'Summer Classic Tournament' : 'Fall Championship Series',
          location: tournamentId === '1' ? 'Orlando, FL' : 'Phoenix, AZ',
          description: tournamentId === '1' ? 'Premier summer tournament for youth baseball' : 'Competitive fall tournament series',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _count: { reviews: 3 },
          reviews: [
            { 
              id: '1', 
              overall_rating: 4.5, 
              comment: 'Great tournament organization',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            { 
              id: '2', 
              overall_rating: 5.0, 
              comment: 'Excellent facilities and competition',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            { 
              id: '3', 
              overall_rating: 4.0, 
              comment: 'Good experience overall',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        },
        message: 'Tournament retrieved successfully'
      });
    }
    
    // Return list of tournaments
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
            _count: { reviews: 8 },
            reviews: [
              { 
                id: '1', 
                overall_rating: 4.5, 
                comment: 'Great tournament organization',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              { 
                id: '2', 
                overall_rating: 5.0, 
                comment: 'Excellent facilities and competition',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              { 
                id: '3', 
                overall_rating: 4.0, 
                comment: 'Good experience overall',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
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
            _count: { reviews: 3 },
            reviews: [
              { 
                id: '4', 
                overall_rating: 4.8, 
                comment: 'Well run tournament',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              { 
                id: '5', 
                overall_rating: 4.2, 
                comment: 'Nice fields and good competition',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              { 
                id: '6', 
                overall_rating: 4.6, 
                comment: 'Solid tournament experience',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
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