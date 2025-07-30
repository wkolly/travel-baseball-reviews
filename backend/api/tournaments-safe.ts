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

  // Log the request for debugging
  console.log('Tournament request received:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    userAgent: req.headers['user-agent']?.substring(0, 50)
  });

  // Handle GET requests
  if (req.method === 'GET') {
    const { url } = req;
    
    // Check if this is a request for a specific tournament (e.g., /tournaments/1)
    const tournamentIdMatch = url?.match(/\/tournaments\/([^\/\?]+)/);
    if (tournamentIdMatch) {
      const tournamentId = tournamentIdMatch[1];
      
      console.log('Individual tournament request for ID:', tournamentId);
      
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
          averageRating: 4.5,
          avgRating: 4.5,
          rating: 4.5,
          overallRating: 4.5,
          _count: { 
            reviews: 3 
          },
          reviews: [
            {
              id: '1',
              tournamentId: tournamentId,
              userId: null,
              overall_rating: 4.5,
              rating: 4.5,
              overallRating: 4.5,
              comment: 'Great tournament organization and facilities',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: '2',
              tournamentId: tournamentId,
              userId: null,
              overall_rating: 5.0,
              rating: 5.0,
              overallRating: 5.0,
              comment: 'Excellent competition and well run event',  
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: '3',
              tournamentId: tournamentId,
              userId: null,
              overall_rating: 4.0,
              rating: 4.0,
              overallRating: 4.0,
              comment: 'Good tournament overall, nice fields',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        },
        message: 'Tournament details retrieved successfully'
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
            averageRating: 4.5,
            avgRating: 4.5,
            rating: 4.5,
            overallRating: 4.5,
            _count: { 
              reviews: 3 
            },
            reviews: [
              {
                id: '1',
                tournamentId: '1',
                userId: null,
                overall_rating: 4.5,
                rating: 4.5,
                overallRating: 4.5,
                comment: 'Great tournament organization and facilities',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: '2',
                tournamentId: '1',
                userId: null,
                overall_rating: 5.0,
                rating: 5.0,
                overallRating: 5.0,
                comment: 'Excellent competition and well run event',  
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: '3',
                tournamentId: '1',
                userId: null,
                overall_rating: 4.0,
                rating: 4.0,
                overallRating: 4.0,
                comment: 'Good tournament overall, nice fields',
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
            averageRating: 4.5,
            avgRating: 4.5,
            rating: 4.5,
            overallRating: 4.5,
            _count: { 
              reviews: 2 
            },
            reviews: [
              {
                id: '4',
                tournamentId: '2',
                userId: null,
                overall_rating: 4.8,
                rating: 4.8,
                overallRating: 4.8,
                comment: 'Well organized tournament with great competition',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: '5',
                tournamentId: '2',
                userId: null,
                overall_rating: 4.2,
                rating: 4.2,
                overallRating: 4.2,
                comment: 'Nice facilities and good tournament structure',
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

  // Original data (commented out for now)
  if (req.method === 'GET_DISABLED') {
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
                tournamentId: '1',
                userId: null,
                overall_rating: 4.5,
                coaching_rating: 4.5,
                value_rating: 4.5,
                organization_rating: 4.5,
                playing_time_rating: 4.5,
                comment: 'Great tournament',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              { 
                id: '2',
                tournamentId: '1', 
                userId: null,
                overall_rating: 5.0,
                coaching_rating: 5.0,
                value_rating: 5.0,
                organization_rating: 5.0,
                playing_time_rating: 5.0,
                comment: 'Excellent tournament',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              { 
                id: '3',
                tournamentId: '1',
                userId: null,
                overall_rating: 4.0,
                coaching_rating: 4.0,
                value_rating: 4.0,
                organization_rating: 4.0,
                playing_time_rating: 4.0,
                comment: 'Good tournament',
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
            _count: { 
              reviews: 3 
            },
            reviews: [
              { 
                id: '4',
                tournamentId: '2',
                userId: null,
                overall_rating: 4.8,
                coaching_rating: 4.8,
                value_rating: 4.8,
                organization_rating: 4.8,
                playing_time_rating: 4.8,
                comment: 'Well organized',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              { 
                id: '5',
                tournamentId: '2',
                userId: null,
                overall_rating: 4.2,
                coaching_rating: 4.2,
                value_rating: 4.2,
                organization_rating: 4.2,
                playing_time_rating: 4.2,
                comment: 'Good experience',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              { 
                id: '6',
                tournamentId: '2',
                userId: null,
                overall_rating: 4.6,
                coaching_rating: 4.6,
                value_rating: 4.6,
                organization_rating: 4.6,
                playing_time_rating: 4.6,
                comment: 'Solid tournament',
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

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}