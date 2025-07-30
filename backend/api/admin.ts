// In-memory data store for demo purposes
let teamsData = [
  {
    id: '1',
    name: 'Atlanta Thunder',
    location: 'Atlanta',
    state: 'GA',
    ageGroups: '["12U", "14U"]',
    description: 'Competitive travel baseball team',
    status: 'approved',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    user: {
      id: 'user-1',
      name: 'Coach Thompson',
      email: 'coach@atlantathunder.com'
    },
    _count: { reviews: 3 }
  },
  {
    id: '2',
    name: 'Dallas Diamonds',
    location: 'Dallas',
    state: 'TX',
    ageGroups: '["10U", "12U"]',
    description: 'Premier youth baseball organization',
    status: 'approved',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    user: {
      id: 'user-2', 
      name: 'Manager Davis',
      email: 'manager@dallasdiamonds.com'
    },
    _count: { reviews: 2 }
  },
  {
    id: '3',
    name: 'Houston Heat',
    location: 'Houston',
    state: 'TX',
    ageGroups: '["14U", "16U"]',
    description: 'Competitive baseball team focused on player development',
    status: 'pending',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    user: {
      id: 'user-3',
      name: 'Director Martinez',
      email: 'director@houstonheat.com'
    },
    _count: { reviews: 0 }
  }
];

let tournamentsData = [
  {
    id: '1',
    name: 'Summer Championship Series',
    location: 'Orlando, FL',
    startDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 32 * 86400000).toISOString(),
    ageGroups: '["12U", "14U", "16U"]',
    description: 'Premier summer tournament featuring top teams from across the Southeast',
    entryFee: 850,
    maxTeams: 32,
    status: 'active',
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    user: {
      id: 'user-1',
      name: 'Tournament Director',
      email: 'director@summerseries.com'
    },
    _count: { reviews: 1 }
  },
  {
    id: '2',
    name: 'Fall Classic Tournament',
    location: 'Phoenix, AZ',
    startDate: new Date(Date.now() + 60 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 62 * 86400000).toISOString(),
    ageGroups: '["10U", "12U", "14U"]',
    description: 'Annual fall tournament with excellent facilities',
    entryFee: 750,
    maxTeams: 24,
    status: 'active',
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    user: {
      id: 'user-2',
      name: 'Classic Organizer',
      email: 'organizer@fallclassic.com'
    },
    _count: { reviews: 2 }
  }
];

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
  console.log('Admin request received:', { method: req.method, url, timestamp: new Date().toISOString() });

  // Route handling based on URL path
  if (url?.includes('/admin/stats')) {
    if (req.method === 'GET') {
      const approvedTeams = teamsData.filter(t => t.status === 'approved').length;
      const pendingTeams = teamsData.filter(t => t.status === 'pending').length;
      
      return res.status(200).json({
        success: true,
        data: {
          teams: {
            total: teamsData.length,
            approved: approvedTeams,
            pending: pendingTeams
          },
          tournaments: {
            total: tournamentsData.length
          },
          users: {
            total: 5
          },
          reviews: {
            total: 8
          },
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
            },
            {
              id: '3',
              type: 'team_pending',
              description: 'Houston Heat submitted for approval',
              timestamp: new Date(Date.now() - 2 * 86400000).toISOString()
            }
          ]
        },
        message: 'Admin stats retrieved successfully'
      });
    }
  }

  if (url?.includes('/admin/users')) {
    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        data: {
          users: [
            {
              id: 'admin-user',
              email: 'admin@travelballhub.com',
              name: 'Admin',
              role: 'ADMIN',
              createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
              updatedAt: new Date().toISOString(),
              _count: { reviews: 0 }
            },
            {
              id: 'user-1',
              email: 'parent1@example.com',
              name: 'Parent One',
              role: 'USER',
              createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
              updatedAt: new Date(Date.now() - 86400000).toISOString(),
              _count: { reviews: 3 }
            },
            {
              id: 'user-2',
              email: 'coach@example.com',
              name: 'Coach Smith',
              role: 'USER',
              createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
              updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
              _count: { reviews: 2 }
            },
            {
              id: 'user-3',
              email: 'parent2@example.com',
              name: 'Parent Two',
              role: 'USER',
              createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
              updatedAt: new Date().toISOString(),
              _count: { reviews: 1 }
            }
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 4,
            totalPages: 1
          }
        },
        message: 'Users retrieved successfully'
      });
    }
  }

  if (url?.includes('/admin/teams')) {
    if (req.method === 'GET') {
      console.log('Admin teams request - returning teams data');
      return res.status(200).json({
        success: true,
        data: {
          teams: teamsData,
          pagination: {
            page: 1,
            limit: 20,
            total: teamsData.length,
            totalPages: 1
          }
        },
        message: 'Teams retrieved successfully'
      });
    }

    if (req.method === 'PUT') {
      const teamIdMatch = url?.match(/\/admin\/teams\/([^\/\?]+)/);
      const teamId = teamIdMatch?.[1];
      
      // Find and update the team
      const teamIndex = teamsData.findIndex(t => t.id === teamId);
      if (teamIndex !== -1) {
        teamsData[teamIndex] = {
          ...teamsData[teamIndex],
          ...req.body,
          updatedAt: new Date().toISOString()
        };
        
        return res.status(200).json({
          success: true,
          data: teamsData[teamIndex],
          message: 'Team updated successfully'
        });
      }
      
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    if (req.method === 'DELETE') {
      const teamIdMatch = url?.match(/\/admin\/teams\/([^\/\?]+)/);
      const teamId = teamIdMatch?.[1];
      
      // Find and remove the team
      const teamIndex = teamsData.findIndex(t => t.id === teamId);
      if (teamIndex !== -1) {
        const deletedTeam = teamsData.splice(teamIndex, 1)[0];
        
        return res.status(200).json({
          success: true,
          data: deletedTeam,
          message: 'Team deleted successfully'
        });
      }
      
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }
  }

  if (url?.includes('/admin/tournaments')) {
    if (req.method === 'GET') {
      console.log('Admin tournaments request - returning tournaments data');
      return res.status(200).json({
        success: true,
        data: {
          tournaments: tournamentsData,
          pagination: {
            page: 1,
            limit: 20,
            total: tournamentsData.length,
            totalPages: 1
          }
        },
        message: 'Tournaments retrieved successfully'
      });
    }

    if (req.method === 'PUT') {
      const tournamentIdMatch = url?.match(/\/admin\/tournaments\/([^\/\?]+)/);
      const tournamentId = tournamentIdMatch?.[1];
      
      // Find and update the tournament
      const tournamentIndex = tournamentsData.findIndex(t => t.id === tournamentId);
      if (tournamentIndex !== -1) {
        tournamentsData[tournamentIndex] = {
          ...tournamentsData[tournamentIndex],
          ...req.body,
          updatedAt: new Date().toISOString()
        };
        
        return res.status(200).json({
          success: true,
          data: tournamentsData[tournamentIndex],
          message: 'Tournament updated successfully'
        });
      }
      
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    if (req.method === 'DELETE') {
      const tournamentIdMatch = url?.match(/\/admin\/tournaments\/([^\/\?]+)/);
      const tournamentId = tournamentIdMatch?.[1];
      
      // Find and remove the tournament
      const tournamentIndex = tournamentsData.findIndex(t => t.id === tournamentId);
      if (tournamentIndex !== -1) {
        const deletedTournament = tournamentsData.splice(tournamentIndex, 1)[0];
        
        return res.status(200).json({
          success: true,
          data: deletedTournament,
          message: 'Tournament deleted successfully'
        });
      }
      
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }
  }

  if (url?.includes('/admin/reviews')) {
    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        data: {
          reviews: [
            {
              id: '1',
              type: 'team',
              teamId: '1',
              team: { 
                id: '1',
                name: 'Atlanta Thunder',
                location: 'Atlanta',
                state: 'GA'
              },
              userId: 'user-1',
              user: { 
                id: 'user-1',
                name: 'Parent One', 
                email: 'parent1@example.com' 
              },
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
              team: { 
                id: '1',
                name: 'Atlanta Thunder',
                location: 'Atlanta',
                state: 'GA'
              },
              userId: 'user-2',
              user: { 
                id: 'user-2',
                name: 'Coach Smith', 
                email: 'coach@example.com' 
              },
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
              tournament: { 
                id: '1',
                name: 'Summer Championship Series',
                location: 'Orlando, FL'
              },
              userId: 'user-3',
              user: { 
                id: 'user-3',
                name: 'Parent Two', 
                email: 'parent2@example.com' 
              },
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
  }

  if (url?.includes('/admin/pending-teams')) {
    if (req.method === 'GET') {
      const pendingTeams = teamsData.filter(t => t.status === 'pending');
      return res.status(200).json({
        success: true,
        data: {
          teams: pendingTeams,
          pagination: {
            page: 1,
            limit: 20,
            total: pendingTeams.length,
            totalPages: 1
          }
        },
        message: 'Pending teams retrieved successfully'
      });
    }
  }

  // Handle team approval/rejection
  if (url?.match(/\/admin\/teams\/\d+\/approve/) || url?.match(/\/teams\/\d+\/approve/)) {
    if (req.method === 'PUT') {
      const teamIdMatch = url?.match(/\/teams\/(\d+)\/approve/);
      const teamId = teamIdMatch?.[1];
      
      // Find and approve the team
      const teamIndex = teamsData.findIndex(t => t.id === teamId);
      if (teamIndex !== -1) {
        teamsData[teamIndex].status = 'approved';
        teamsData[teamIndex].updatedAt = new Date().toISOString();
        
        return res.status(200).json({
          success: true,
          data: teamsData[teamIndex],
          message: 'Team approved successfully'
        });
      }
      
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }
  }

  if (url?.match(/\/admin\/teams\/\d+\/reject/) || url?.match(/\/teams\/\d+\/reject/)) {
    if (req.method === 'PUT') {
      const teamIdMatch = url?.match(/\/teams\/(\d+)\/reject/);
      const teamId = teamIdMatch?.[1];
      
      // Find and reject the team (remove it)
      const teamIndex = teamsData.findIndex(t => t.id === teamId);
      if (teamIndex !== -1) {
        const rejectedTeam = teamsData.splice(teamIndex, 1)[0];
        
        return res.status(200).json({
          success: true,
          data: rejectedTeam,
          message: 'Team rejected successfully'
        });
      }
      
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }
  }

  // Handle review deletion endpoints
  if (url?.includes('/admin/reviews/teams/')) {
    if (req.method === 'DELETE') {
      const reviewIdMatch = url?.match(/\/admin\/reviews\/teams\/([^\/\?]+)/);
      const reviewId = reviewIdMatch?.[1];
      
      return res.status(200).json({
        success: true,
        message: 'Team review deleted successfully'
      });
    }
  }

  if (url?.includes('/admin/reviews/tournaments/')) {
    if (req.method === 'DELETE') {
      const reviewIdMatch = url?.match(/\/admin\/reviews\/tournaments\/([^\/\?]+)/);
      const reviewId = reviewIdMatch?.[1];
      
      return res.status(200).json({
        success: true,
        message: 'Tournament review deleted successfully'
      });
    }
  }

  // Log 404s for debugging
  console.log('Admin 404 - URL not matched:', url, 'Method:', req.method);
  console.log('Admin 404 - Full request details:', { 
    url, 
    method: req.method, 
    headers: req.headers,
    query: req.query,
    body: req.body 
  });
  
  return res.status(404).json({
    success: false,
    message: 'Admin endpoint not found',
    url: url,
    method: req.method
  });
}