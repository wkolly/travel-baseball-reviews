import { 
  getAllTeams, 
  getAllTournaments,
  getPendingTeams, 
  createTeam, 
  updateTeam, 
  deleteTeam, 
  approveTeam, 
  rejectTeam,
  getTeamStats,
  initializeDatabase
} from './postgres-db';

export default async function handler(req: any, res: any) {
  try {
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

  // Debug endpoint to check pending teams specifically
  if (url?.includes('/admin/debug-pending')) {
    try {
      console.log('Debug pending teams request');
      const pendingTeams = await getPendingTeams();
      console.log('Pending teams from database:', pendingTeams);
      
      return res.status(200).json({
        success: true,
        data: {
          pendingTeams: pendingTeams,
          count: pendingTeams.length,
          databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not Set',
          timestamp: new Date().toISOString()
        },
        message: 'Debug pending teams'
      });
    } catch (error) {
      console.error('Debug pending teams error:', error);
      return res.status(500).json({
        success: false,
        data: {
          error: error instanceof Error ? error.message : String(error),
          databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not Set'
        },
        message: 'Debug pending teams failed'
      });
    }
  }

  // Debug endpoint to check database schema
  if (url?.includes('/admin/debug-db')) {
    try {
      const { Client } = await import('pg');
      const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      });
      
      await client.connect();
      
      // Check if teams table exists and what columns it has
      const tablesResult = await client.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'teams'
      `);
      
      let columnsInfo = null;
      if (tablesResult.rows.length > 0) {
        const columnsResult = await client.query(`
          SELECT column_name, data_type FROM information_schema.columns 
          WHERE table_name = 'teams' AND table_schema = 'public'
          ORDER BY ordinal_position
        `);
        columnsInfo = columnsResult.rows;
      }
      
      await client.end();
      
      return res.status(200).json({
        success: true,
        data: {
          connectionTest: 'SUCCESS',
          teamsTableExists: tablesResult.rows.length > 0,
          columns: columnsInfo,
          timestamp: new Date().toISOString()
        },
        message: 'Database schema check'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        data: {
          error: error instanceof Error ? error.message : String(error),
          errorCode: (error as any)?.code
        },
        message: 'Database schema check failed'
      });
    }
  }

  // Initialize database on first request
  try {
    await initializeDatabase();
  } catch (error) {
    console.error('Database initialization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database connection error',
      error: error instanceof Error ? error.message : String(error)
    });
  }

  // Handle team suggestions at top level  
  if (req.method === 'POST' && url?.includes('/suggest')) {
    console.log('Team suggestion received at top level:', req.body);
    
    try {
      const newTeam = await createTeam(req.body);
      console.log('Team added to database:', newTeam);
      
      return res.status(201).json({
        success: true,
        data: newTeam,
        message: 'Team suggestion added to pending list successfully'
      });
    } catch (error) {
      console.error('Error creating team:', error);
      return res.status(500).json({
        success: false,
        message: 'Error creating team suggestion'
      });
    }
  }

  // Route handling based on URL path
  if (url?.includes('/admin/stats')) {
    if (req.method === 'GET') {
      const teamStats = await getTeamStats();
      const tournaments = await getAllTournaments();
      
      return res.status(200).json({
        success: true,
        data: {
          teams: teamStats,
          tournaments: {
            total: tournaments.length
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
    console.log('Processing admin teams request:', { method: req.method, url, hasApprove: url?.includes('/approve'), hasReject: url?.includes('/reject') });
    
    if (req.method === 'GET') {
      try {
        console.log('Admin teams request - returning teams data');
        const teams = await getAllTeams();
        console.log('All teams result:', teams);
        
        // Ensure we always return an array
        const safeTeams = Array.isArray(teams) ? teams : [];
        
        // Ensure each team has the exact structure the frontend expects
        const formattedTeams = safeTeams.map(team => ({
          id: team.id || 'unknown',
          name: team.name || 'Unknown Team',
          location: team.location || '',
          state: team.state || '',
          ageGroups: (() => {
            try {
              if (Array.isArray(team.ageGroups)) return team.ageGroups;
              if (!team.ageGroups) return [];
              
              // Handle different ageGroups formats in database
              let ageGroupsStr = team.ageGroups;
              
              // If it's already a valid JSON array string, parse it
              if (ageGroupsStr.startsWith('[') && ageGroupsStr.endsWith(']')) {
                return JSON.parse(ageGroupsStr);
              }
              
              // If it's double-encoded JSON, parse twice
              if (ageGroupsStr.startsWith('"') && ageGroupsStr.endsWith('"')) {
                const firstParse = JSON.parse(ageGroupsStr);
                if (typeof firstParse === 'string') {
                  return JSON.parse(firstParse);
                }
                return firstParse;
              }
              
              // If it's just a plain string like "12U", wrap it in an array
              return [ageGroupsStr];
            } catch (e) {
              console.warn('Failed to parse ageGroups for team', team.id, ':', e.message);
              return team.ageGroups ? [String(team.ageGroups)] : [];
            }
          })(),
          description: team.description || '',
          status: team.status || 'pending',
          createdAt: team.createdAt || new Date().toISOString(),
          updatedAt: team.updatedAt || new Date().toISOString(),
          suggestedBy: team.suggestedBy || null,
          approvedBy: team.approvedBy || null,
          approvedAt: team.approvedAt || null,
          contact: team.contact || null,
          user: {
            id: team.user?.id || 'unknown',
            name: team.user?.name || 'Unknown User',
            email: team.user?.email || 'unknown@example.com'
          },
          _count: { reviews: team._count?.reviews || 0 }
        }));

        return res.status(200).json({
          success: true,
          data: {
            teams: formattedTeams,
            pagination: {
              page: 1,
              limit: 20,
              total: formattedTeams.length,
              totalPages: 1
            }
          },
          message: 'Teams retrieved successfully'
        });
      } catch (error) {
        console.error('Error fetching all teams:', error);
        return res.status(200).json({
          success: true,
          data: {
            teams: [],
            pagination: {
              page: 1,
              limit: 20,
              total: 0,
              totalPages: 1
            }
          },
          message: 'No teams found (error occurred)',
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // Handle team suggestions from the public form
    if (req.method === 'POST' && (url?.includes('/admin/teams/suggest') || url?.includes('/teams/suggest'))) {
      console.log('Team suggestion received in admin:', req.body);
      
      try {
        const newTeam = await createTeam(req.body);
        console.log('Team added to database:', newTeam);
        
        return res.status(201).json({
          success: true,
          data: newTeam,
          message: 'Team suggestion added to pending list successfully'
        });
      } catch (error) {
        console.error('Error creating team:', error);
        return res.status(500).json({
          success: false,
          message: 'Error creating team suggestion'
        });
      }
    }

    // Handle team approval first
    if (req.method === 'PUT' && url?.includes('/approve')) {
      const teamIdMatch = url?.match(/\/admin\/teams\/([^\/]+)\/approve/);
      const teamId = teamIdMatch?.[1];
      
      try {
        const approvedTeam = await approveTeam(teamId);
        if (approvedTeam) {
          return res.status(200).json({
            success: true,
            data: approvedTeam,
            message: 'Team approved successfully'
          });
        }
        
        return res.status(404).json({
          success: false,
          message: 'Team not found'
        });
      } catch (error) {
        console.error('Error approving team:', error);
        return res.status(500).json({
          success: false,
          message: 'Error approving team'
        });
      }
    }

    // Handle team rejection
    if (req.method === 'PUT' && url?.includes('/reject')) {
      const teamIdMatch = url?.match(/\/admin\/teams\/([^\/]+)\/reject/);
      const teamId = teamIdMatch?.[1];
      
      try {
        const rejectedTeam = await rejectTeam(teamId);
        if (rejectedTeam) {
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
      } catch (error) {
        console.error('Error rejecting team:', error);
        return res.status(500).json({
          success: false,
          message: 'Error rejecting team'
        });
      }
    }

    // Handle general team updates
    if (req.method === 'PUT') {
      const teamIdMatch = url?.match(/\/admin\/teams\/([^\/\?]+)/);
      const teamId = teamIdMatch?.[1];
      
      try {
        const updatedTeam = await updateTeam(teamId, req.body);
        if (updatedTeam) {
          return res.status(200).json({
            success: true,
            data: updatedTeam,
            message: 'Team updated successfully'
          });
        }
        
        return res.status(404).json({
          success: false,
          message: 'Team not found'
        });
      } catch (error) {
        console.error('Error updating team:', error);
        return res.status(500).json({
          success: false,
          message: 'Error updating team'
        });
      }
    }


    if (req.method === 'DELETE') {
      const teamIdMatch = url?.match(/\/admin\/teams\/([^\/\?]+)/);
      const teamId = teamIdMatch?.[1];
      
      try {
        const deletedTeam = await deleteTeam(teamId);
        if (deletedTeam) {
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
      } catch (error) {
        console.error('Error deleting team:', error);
        return res.status(500).json({
          success: false,
          message: 'Error deleting team'
        });
      }
    }
  }

  if (url?.includes('/admin/tournaments')) {
    if (req.method === 'GET') {
      console.log('Admin tournaments request - returning tournaments data');
      const tournaments = await getAllTournaments();
      return res.status(200).json({
        success: true,
        data: {
          tournaments: tournaments,
          pagination: {
            page: 1,
            limit: 20,
            total: tournaments.length,
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
      try {
        console.log('Fetching pending teams...');
        const pendingTeams = await getPendingTeams();
        console.log('Pending teams result:', pendingTeams);
        
        // Ensure we always return an array
        const safeTeams = Array.isArray(pendingTeams) ? pendingTeams : [];
        
        // Ensure each team has the exact structure the frontend expects
        const formattedTeams = safeTeams.map(team => ({
          id: team.id || 'unknown',
          name: team.name || 'Unknown Team',
          location: team.location || '',
          state: team.state || '',
          ageGroups: (() => {
            try {
              if (Array.isArray(team.ageGroups)) return team.ageGroups;
              if (!team.ageGroups) return [];
              
              // Handle different ageGroups formats in database
              let ageGroupsStr = team.ageGroups;
              
              // If it's already a valid JSON array string, parse it
              if (ageGroupsStr.startsWith('[') && ageGroupsStr.endsWith(']')) {
                return JSON.parse(ageGroupsStr);
              }
              
              // If it's double-encoded JSON, parse twice
              if (ageGroupsStr.startsWith('"') && ageGroupsStr.endsWith('"')) {
                const firstParse = JSON.parse(ageGroupsStr);
                if (typeof firstParse === 'string') {
                  return JSON.parse(firstParse);
                }
                return firstParse;
              }
              
              // If it's just a plain string like "12U", wrap it in an array
              return [ageGroupsStr];
            } catch (e) {
              console.warn('Failed to parse ageGroups for team', team.id, ':', e.message);
              return team.ageGroups ? [String(team.ageGroups)] : [];
            }
          })(),
          description: team.description || '',
          status: team.status || 'pending',
          createdAt: team.createdAt || new Date().toISOString(),
          updatedAt: team.updatedAt || new Date().toISOString(),
          suggestedBy: team.suggestedBy || null,
          approvedBy: team.approvedBy || null,
          approvedAt: team.approvedAt || null,
          contact: team.contact || null,
          user: {
            id: team.user?.id || 'unknown',
            name: team.user?.name || 'Unknown User',
            email: team.user?.email || 'unknown@example.com'
          },
          _count: { reviews: team._count?.reviews || 0 }
        }));

        return res.status(200).json({
          success: true,
          data: {
            teams: formattedTeams,
            pagination: {
              page: 1,
              limit: 20,
              total: formattedTeams.length,
              totalPages: 1
            }
          },
          message: 'Pending teams retrieved successfully'
        });
      } catch (error) {
        console.error('Error fetching pending teams:', error);
        return res.status(200).json({
          success: true,
          data: {
            teams: [],
            pagination: {
              page: 1,
              limit: 20,
              total: 0,
              totalPages: 1
            }
          },
          message: 'No pending teams found (error occurred)',
          error: error instanceof Error ? error.message : String(error)
        });
      }
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
  
  // Ensure CORS headers are set on 404 responses too
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  return res.status(404).json({
    success: false,
    message: 'Admin endpoint not found',
    url: url,
    method: req.method,
    debugInfo: {
      includesAdminTeams: url?.includes('/admin/teams'),
      includesApprove: url?.includes('/approve'),
      includesReject: url?.includes('/reject'),
      includesSuggest: url?.includes('/suggest'),
      fullUrlCheck: url?.includes('/admin/teams/suggest')
    }
  });
  
  } catch (error) {
    console.error('Admin handler error:', error);
    
    // Ensure CORS headers even on errors
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error in admin handler',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}