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
  console.log('Teams request received:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin
  });

  // Handle GET requests
  if (req.method === 'GET') {
    const { url } = req;
    
    // Check if this is a request for a specific team (e.g., /teams/1)
    const teamIdMatch = url?.match(/\/teams\/([^\/\?]+)/);
    if (teamIdMatch) {
      const teamId = teamIdMatch[1];
      
      console.log('Individual team request for ID:', teamId);
      
      // Return single team data
      return res.status(200).json({
        success: true,
        data: {
          id: teamId,
          name: teamId === '1' ? 'Atlanta Thunder' : 'Dallas Diamonds',
          location: teamId === '1' ? 'Atlanta' : 'Dallas',
          state: teamId === '1' ? 'GA' : 'TX',
          ageGroups: teamId === '1' ? '["12U", "14U"]' : '["10U", "12U"]',
          description: teamId === '1' ? 'Competitive travel baseball team' : 'Premier youth baseball organization',
          status: 'approved',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _count: { reviews: 3 },
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
        message: 'Team details retrieved successfully'
      });
    }
    
    // Return list of teams
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
              { 
                id: '1', 
                teamId: '1',
                userId: null,
                overall_rating: 4.2, 
                coaching_rating: 4, 
                value_rating: 4, 
                organization_rating: 5, 
                playing_time_rating: 4, 
                comment: 'Great team',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              { 
                id: '2', 
                teamId: '1',
                userId: null,
                overall_rating: 4.8, 
                coaching_rating: 5, 
                value_rating: 4, 
                organization_rating: 5, 
                playing_time_rating: 5,
                comment: 'Excellent team',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
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
              { 
                id: '3', 
                teamId: '2',
                userId: null,
                overall_rating: 4.6, 
                coaching_rating: 5, 
                value_rating: 4, 
                organization_rating: 4, 
                playing_time_rating: 5,
                comment: 'Good team',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              { 
                id: '4', 
                teamId: '2',
                userId: null,
                overall_rating: 4.0, 
                coaching_rating: 4, 
                value_rating: 4, 
                organization_rating: 4, 
                playing_time_rating: 4,
                comment: 'Solid team',
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
      message: 'Teams retrieved successfully'
    });
  }

  // Handle POST for creating teams
  if (req.method === 'POST') {
    // Import the shared data function
    const { addTeam } = require('./shared-data');
    
    console.log('Team suggestion received:', req.body);
    
    try {
      const newTeam = addTeam(req.body);
      
      console.log('New team added to pending list:', newTeam);
      
      return res.status(201).json({
        success: true,
        data: newTeam,
        message: 'Team suggestion submitted successfully and is pending approval'
      });
    } catch (error) {
      console.error('Error adding team:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to submit team suggestion'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}