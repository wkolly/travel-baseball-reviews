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
  getAllUsers,
  getAllReviewsForAdmin,
  getTotalReviewCount,
  deleteTeamReview,
  deleteTournamentReview,
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
      try {
        const teamStats = await getTeamStats();
        const tournaments = await getAllTournaments();
        const users = await getAllUsers();
        const reviewStats = await getTotalReviewCount();
        
        return res.status(200).json({
          success: true,
          data: {
            teams: teamStats,
            tournaments: {
              total: tournaments.length
            },
            users: {
              total: users.length
            },
            reviews: {
              total: reviewStats.total,
              teamReviews: reviewStats.teamReviews,
              tournamentReviews: reviewStats.tournamentReviews
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
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        return res.status(500).json({
          success: false,
          message: 'Error retrieving admin stats',
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }

  if (url?.includes('/admin/users')) {
    if (req.method === 'GET') {
      try {
        console.log('Admin users request - fetching real users from database');
        const users = await getAllUsers();
        console.log('Real users result:', users);
        
        return res.status(200).json({
          success: true,
          data: {
            users: users,
            pagination: {
              page: 1,
              limit: 20,
              total: users.length,
              totalPages: Math.ceil(users.length / 20)
            }
          },
          message: 'Users retrieved successfully'
        });
      } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(200).json({
          success: true,
          data: {
            users: [],
            pagination: {
              page: 1,
              limit: 20,
              total: 0,
              totalPages: 1
            }
          },
          message: 'No users found (error occurred)',
          error: error instanceof Error ? error.message : String(error)
        });
      }
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
              if (!team.ageGroups) return '[]';
              
              // Handle different ageGroups formats in database and return as JSON string
              let ageGroupsStr = team.ageGroups;
              
              // If it's already a valid JSON array string, return as-is
              if (ageGroupsStr.startsWith('[') && ageGroupsStr.endsWith(']')) {
                JSON.parse(ageGroupsStr); // Validate it's valid JSON
                return ageGroupsStr;
              }
              
              // If it's double-encoded JSON, parse once and return the inner JSON string
              if (ageGroupsStr.startsWith('"') && ageGroupsStr.endsWith('"')) {
                const firstParse = JSON.parse(ageGroupsStr);
                if (typeof firstParse === 'string') {
                  return firstParse; // Return the inner JSON string
                }
                return JSON.stringify(firstParse);
              }
              
              // If it's just a plain string like "12U", wrap it in an array and stringify
              return JSON.stringify([ageGroupsStr]);
            } catch (e) {
              console.warn('Failed to parse ageGroups for team', team.id, ':', e.message);
              return team.ageGroups ? JSON.stringify([String(team.ageGroups)]) : '[]';
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
      try {
        console.log('Admin reviews request - fetching real reviews from database');
        const reviews = await getAllReviewsForAdmin();
        console.log('Real reviews result:', reviews.length);
        
        return res.status(200).json({
          success: true,
          data: {
            reviews: reviews,
            pagination: {
              page: 1,
              limit: 20,
              total: reviews.length,
              totalPages: Math.ceil(reviews.length / 20)
            }
          },
          message: 'Reviews retrieved successfully'
        });
      } catch (error) {
        console.error('Error fetching reviews for admin:', error);
        return res.status(200).json({
          success: true,
          data: {
            reviews: [],
            pagination: {
              page: 1,
              limit: 20,
              total: 0,
              totalPages: 1
            }
          },
          message: 'No reviews found (error occurred)',
          error: error instanceof Error ? error.message : String(error)
        });
      }
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
              if (!team.ageGroups) return '[]';
              
              // Handle different ageGroups formats in database and return as JSON string
              let ageGroupsStr = team.ageGroups;
              
              // If it's already a valid JSON array string, return as-is
              if (ageGroupsStr.startsWith('[') && ageGroupsStr.endsWith(']')) {
                JSON.parse(ageGroupsStr); // Validate it's valid JSON
                return ageGroupsStr;
              }
              
              // If it's double-encoded JSON, parse once and return the inner JSON string
              if (ageGroupsStr.startsWith('"') && ageGroupsStr.endsWith('"')) {
                const firstParse = JSON.parse(ageGroupsStr);
                if (typeof firstParse === 'string') {
                  return firstParse; // Return the inner JSON string
                }
                return JSON.stringify(firstParse);
              }
              
              // If it's just a plain string like "12U", wrap it in an array and stringify
              return JSON.stringify([ageGroupsStr]);
            } catch (e) {
              console.warn('Failed to parse ageGroups for team', team.id, ':', e.message);
              return team.ageGroups ? JSON.stringify([String(team.ageGroups)]) : '[]';
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
      try {
        const reviewIdMatch = url?.match(/\/admin\/reviews\/teams\/([^\/\?]+)/);
        const reviewId = reviewIdMatch?.[1];
        
        if (!reviewId) {
          return res.status(400).json({
            success: false,
            message: 'Review ID is required'
          });
        }
        
        console.log('Deleting team review:', reviewId);
        const deletedReview = await deleteTeamReview(reviewId);
        
        if (deletedReview) {
          return res.status(200).json({
            success: true,
            data: deletedReview,
            message: 'Team review deleted successfully'
          });
        }
        
        return res.status(404).json({
          success: false,
          message: 'Team review not found'
        });
      } catch (error) {
        console.error('Error deleting team review:', error);
        return res.status(500).json({
          success: false,
          message: 'Error deleting team review',
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }

  if (url?.includes('/admin/reviews/tournaments/')) {
    if (req.method === 'DELETE') {
      try {
        const reviewIdMatch = url?.match(/\/admin\/reviews\/tournaments\/([^\/\?]+)/);
        const reviewId = reviewIdMatch?.[1];
        
        if (!reviewId) {
          return res.status(400).json({
            success: false,
            message: 'Review ID is required'
          });
        }
        
        console.log('Deleting tournament review:', reviewId);
        const deletedReview = await deleteTournamentReview(reviewId);
        
        if (deletedReview) {
          return res.status(200).json({
            success: true,
            data: deletedReview,
            message: 'Tournament review deleted successfully'
          });
        }
        
        return res.status(404).json({
          success: false,
          message: 'Tournament review not found'
        });
      } catch (error) {
        console.error('Error deleting tournament review:', error);
        return res.status(500).json({
          success: false,
          message: 'Error deleting tournament review',
          error: error instanceof Error ? error.message : String(error)
        });
      }
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