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

  // Handle GET requests for all reviews
  if (req.method === 'GET') {
    console.log('Admin reviews request received');
    
    return res.status(200).json({
      success: true,
      data: {
        reviews: [
          {
            id: '1',
            type: 'team',
            teamId: '1',
            team: { name: 'Atlanta Thunder' },
            userId: 'user-1',
            user: { name: 'Parent One', email: 'parent1@example.com' },
            overall_rating: 4.2,
            coaching_rating: 4,
            value_rating: 4,
            organization_rating: 5,
            playing_time_rating: 4,
            comment: 'Great coaching staff and well organized team.',
            createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 5 * 86400000).toISOString()
          },
          {
            id: '2',
            type: 'team',
            teamId: '1',
            team: { name: 'Atlanta Thunder' },
            userId: 'user-2',
            user: { name: 'Coach Smith', email: 'coach@example.com' },
            overall_rating: 4.8,
            coaching_rating: 5,
            value_rating: 4,
            organization_rating: 5,
            playing_time_rating: 5,
            comment: 'Excellent team with great player development.',
            createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 3 * 86400000).toISOString()
          },
          {
            id: '3',
            type: 'tournament',
            tournamentId: '1',
            tournament: { name: 'Summer Championship Series' },
            userId: 'user-3',
            user: { name: 'Parent Two', email: 'parent2@example.com' },
            overall_rating: 4.5,
            facilities_rating: 4,
            organization_rating: 5,
            value_rating: 4,
            competition_rating: 5,
            comment: 'Well organized tournament with great competition.',
            createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          totalPages: 1
        }
      },
      message: 'Reviews retrieved successfully'
    });
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}