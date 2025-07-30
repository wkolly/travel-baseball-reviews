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

  // For now, return mock data
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      data: {
        teams: [
          {
            id: '1',
            name: 'Atlanta Thunder',
            location: 'Atlanta',
            state: 'GA',
            ageGroups: '["12U", "14U"]',
            description: 'Competitive travel baseball team',
            status: 'approved',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            _count: { reviews: 3 },
            reviews: [
              { id: '1', overall_rating: 4.2, coaching_rating: 4, value_rating: 4, organization_rating: 5, playing_time_rating: 4, createdAt: new Date().toISOString() },
              { id: '2', overall_rating: 4.8, coaching_rating: 5, value_rating: 4, organization_rating: 5, playing_time_rating: 5, createdAt: new Date().toISOString() }
            ]
          },
          {
            id: '2', 
            name: 'Dallas Diamonds',
            location: 'Dallas',
            state: 'TX',
            ageGroups: '["10U", "12U"]',
            description: 'Premier youth baseball organization',
            status: 'approved',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            _count: { reviews: 5 },
            reviews: [
              { id: '3', overall_rating: 4.6, coaching_rating: 5, value_rating: 4, organization_rating: 4, playing_time_rating: 5, createdAt: new Date().toISOString() },
              { id: '4', overall_rating: 4.0, coaching_rating: 4, value_rating: 4, organization_rating: 4, playing_time_rating: 4, createdAt: new Date().toISOString() }
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
      message: 'Teams retrieved successfully'
    });
  }

  // Handle POST for creating teams
  if (req.method === 'POST') {
    return res.status(200).json({
      success: true,
      data: {
        id: 'new-team-id',
        name: req.body?.name || 'New Team',
        status: 'pending'
      },
      message: 'Team suggestion submitted successfully'
    });
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}