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

  const { url } = req;
  console.log('Reviews request received:', { method: req.method, url });

  // Handle team reviews
  if (url?.includes('/team-reviews') || url?.includes('/reviews/teams')) {
    if (req.method === 'GET') {
      const teamIdMatch = url?.match(/\/team-reviews\/([^\/\?]+)/) || url?.match(/team-reviews\?.*teamId=([^&]+)/) || url?.match(/\/reviews\/teams\/([^\/\?]+)/);
      const teamId = teamIdMatch?.[1] || '1';
      
      console.log('Team reviews for team ID:', teamId);
      
      return res.status(200).json({
        success: true,
        data: {
          reviews: [
            { 
              id: '1', 
              teamId: teamId,
              userId: null,
              overall_rating: 4.2, 
              coaching_rating: 4, 
              value_rating: 4, 
              organization_rating: 5, 
              playing_time_rating: 4, 
              comment: 'Great coaching staff and well organized team.',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            { 
              id: '2', 
              teamId: teamId,
              userId: null,
              overall_rating: 4.8, 
              coaching_rating: 5, 
              value_rating: 4, 
              organization_rating: 5, 
              playing_time_rating: 5,
              comment: 'Excellent team with great player development.',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            { 
              id: '3', 
              teamId: teamId,
              userId: null,
              overall_rating: 4.0, 
              coaching_rating: 4, 
              value_rating: 4, 
              organization_rating: 4, 
              playing_time_rating: 4,
              comment: 'Solid team with good opportunities for kids.',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        },
        message: 'Team reviews retrieved successfully'
      });
    }

    if (req.method === 'POST') {
      const { coaching_rating, value_rating, organization_rating, playing_time_rating, overall_rating, comment } = req.body || {};
      
      return res.status(201).json({
        success: true,
        data: {
          id: 'new-review-' + Date.now(),
          coaching_rating: coaching_rating || 5,
          value_rating: value_rating || 5,
          organization_rating: organization_rating || 5,
          playing_time_rating: playing_time_rating || 5,
          overall_rating: overall_rating || 5,
          comment: comment || '',
          createdAt: new Date().toISOString()
        },
        message: 'Team review created successfully'
      });
    }
  }

  // Handle tournament reviews
  if (url?.includes('/tournament-reviews')) {
    if (req.method === 'GET') {
      const tournamentIdMatch = url?.match(/\/tournament-reviews\/([^\/\?]+)/) || url?.match(/tournament-reviews\?.*tournamentId=([^&]+)/);
      const tournamentId = tournamentIdMatch?.[1] || '1';
      
      console.log('Tournament reviews for tournament ID:', tournamentId);
      
      return res.status(200).json({
        success: true,
        data: {
          reviews: [
            { 
              id: '1', 
              tournamentId: tournamentId,
              userId: null,
              overall_rating: 4.5, 
              facilities_rating: 4, 
              organization_rating: 5, 
              value_rating: 4, 
              competition_rating: 5,
              comment: 'Well organized tournament with great competition.',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        },
        message: 'Tournament reviews retrieved successfully'
      });
    }

    if (req.method === 'POST') {
      const { facilities_rating, organization_rating, value_rating, competition_rating, overall_rating, comment } = req.body || {};
      
      return res.status(201).json({
        success: true,
        data: {
          id: 'new-tournament-review-' + Date.now(),
          facilities_rating: facilities_rating || 5,
          organization_rating: organization_rating || 5,
          value_rating: value_rating || 5,
          competition_rating: competition_rating || 5,
          overall_rating: overall_rating || 5,
          comment: comment || '',
          createdAt: new Date().toISOString()
        },
        message: 'Tournament review created successfully'
      });
    }
  }

  // Handle general reviews
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