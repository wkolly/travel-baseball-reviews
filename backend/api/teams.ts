import { getAllTeams, getTeamById, getPendingTeams, createTeam, getReviewsByTeamId, initializeDatabase, extractUserIdFromToken } from './postgres-db';

export default async function handler(req: any, res: any) {
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
    
    try {
      // Initialize database
      await initializeDatabase();
      
      // Check if this is a request for a specific team (e.g., /teams/1)
      const teamIdMatch = url?.match(/\/teams\/([^\/\?]+)/);
      if (teamIdMatch) {
        const teamId = teamIdMatch[1];
        
        console.log('Individual team request for ID:', teamId);
        
        const team = await getTeamById(teamId);
        if (team) {
          // Format ageGroups for frontend compatibility
          const formattedTeam = {
            ...team,
            ageGroups: (() => {
              try {
                if (!team.ageGroups) return '[]';
                
                let ageGroupsStr = team.ageGroups;
                
                if (ageGroupsStr.startsWith('[') && ageGroupsStr.endsWith(']')) {
                  JSON.parse(ageGroupsStr);
                  return ageGroupsStr;
                }
                
                if (ageGroupsStr.startsWith('"') && ageGroupsStr.endsWith('"')) {
                  const firstParse = JSON.parse(ageGroupsStr);
                  if (typeof firstParse === 'string') {
                    return firstParse;
                  }
                  return JSON.stringify(firstParse);
                }
                
                return JSON.stringify([ageGroupsStr]);
              } catch (e) {
                console.warn('Failed to parse ageGroups for team', team.id, ':', e.message);
                return team.ageGroups ? JSON.stringify([String(team.ageGroups)]) : '[]';
              }
            })()
          };
          
          // Get real reviews from database
          const reviews = await getReviewsByTeamId(teamId);
          const teamWithReviews = {
            ...formattedTeam,
            reviews: reviews
          };
          
          return res.status(200).json({
            success: true,
            data: teamWithReviews,
            message: 'Team details retrieved successfully'
          });
        }
        
        return res.status(404).json({
          success: false,
          message: 'Team not found'
        });
      }
      
      // Parse query parameters for filtering
      const urlObj = new URL(req.url, `http://${req.headers.host}`);
      const searchQuery = urlObj.searchParams.get('search') || '';
      const stateQuery = urlObj.searchParams.get('state') || '';
      const ageGroupQuery = urlObj.searchParams.get('ageGroup') || '';
      const minRatingQuery = urlObj.searchParams.get('minRating') || '';
      
      console.log('Team query parameters:', { 
        search: searchQuery, 
        state: stateQuery, 
        ageGroup: ageGroupQuery, 
        minRating: minRatingQuery 
      });
      
      // Return list of approved teams only (for public API)
      const allTeams = await getAllTeams();
      let approvedTeams = allTeams.filter(team => team.status === 'approved');
      
      // Apply search filtering
      if (searchQuery) {
        approvedTeams = approvedTeams.filter(team => 
          team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          team.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (team.description && team.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      
      // Apply state filtering
      if (stateQuery) {
        approvedTeams = approvedTeams.filter(team => 
          team.state && team.state.toLowerCase() === stateQuery.toLowerCase()
        );
      }
      
      // Apply age group filtering
      if (ageGroupQuery) {
        approvedTeams = approvedTeams.filter(team => {
          try {
            if (!team.ageGroups) return false;
            
            let ageGroupsArray = [];
            if (typeof team.ageGroups === 'string') {
              // Try to parse as JSON
              try {
                const parsed = JSON.parse(team.ageGroups);
                ageGroupsArray = Array.isArray(parsed) ? parsed : [parsed];
              } catch {
                // If not JSON, treat as single value
                ageGroupsArray = [team.ageGroups];
              }
            } else {
              ageGroupsArray = Array.isArray(team.ageGroups) ? team.ageGroups : [team.ageGroups];
            }
            
            return ageGroupsArray.some(age => 
              String(age).toLowerCase().includes(ageGroupQuery.toLowerCase())
            );
          } catch (error) {
            console.warn('Error filtering by age group for team', team.id, ':', error);
            return false;
          }
        });
      }
      
      // Apply minimum rating filtering (we'll need to calculate average ratings)
      if (minRatingQuery) {
        const minRating = parseFloat(minRatingQuery);
        // For now, we'll skip rating filtering since we'd need to join with reviews
        // This would require a more complex database query
        console.log('Rating filtering not yet implemented, skipping minRating:', minRating);
      }
      
      // Format teams with proper ageGroups handling for frontend
      const formattedTeams = approvedTeams.map(team => ({
        ...team,
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
        })()
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
      console.error('Error retrieving teams:', error);
      return res.status(500).json({
        success: false,
        message: 'Error retrieving teams'
      });
    }
  }

  // Debug endpoint to check team creation
  if (req.method === 'GET' && url?.includes('/debug-teams')) {
    try {
      await initializeDatabase();
      
      const allTeams = await getAllTeams();
      const pendingTeams = await getPendingTeams();
      
      return res.status(200).json({
        success: true,
        data: {
          allTeams: allTeams,
          pendingTeams: pendingTeams,
          allCount: allTeams.length,
          pendingCount: pendingTeams.length,
          databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not Set',
          timestamp: new Date().toISOString()
        },
        message: 'Debug teams data'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        data: {
          error: error instanceof Error ? error.message : String(error),
          databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not Set'
        },
        message: 'Debug teams failed'
      });
    }
  }

  // Handle POST for creating teams
  if (req.method === 'POST') {
    console.log('Team suggestion received:', req.body);
    console.log('Environment check:', {
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not Set',
      nodeEnv: process.env.NODE_ENV
    });
    
    try {
      // Initialize database
      await initializeDatabase();
      
      // Extract user ID from authorization header
      const userId = extractUserIdFromToken(req.headers.authorization);
      console.log('Creating team with user ID:', userId);
      
      const newTeam = await createTeam(req.body, userId);
      
      console.log('Team created in database:', newTeam);
      
      // Ensure the response data is properly serializable
      const responseData = {
        ...newTeam,
        ageGroups: Array.isArray(newTeam.ageGroups) ? newTeam.ageGroups : 
                   (typeof newTeam.ageGroups === 'string' ? JSON.parse(newTeam.ageGroups || '[]') : [])
      };
      
      return res.status(201).json({
        success: true,
        data: responseData,
        message: 'Team suggestion submitted successfully and is now pending admin approval!'
      });
    } catch (error) {
      console.error('Error creating team:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Fallback - create a simple response with safe JSON
      const newTeam = {
        id: 'fallback-' + Date.now(),
        name: req.body?.name || 'New Team',
        location: req.body?.location || '',
        state: req.body?.state || '',
        ageGroups: Array.isArray(req.body?.ageGroups) ? req.body.ageGroups : [],
        description: req.body?.description || '',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: {
          id: 'fallback-user',
          name: req.body?.contact || 'Contact',
          email: 'contact@example.com'
        },
        _count: { reviews: 0 }
      };
      
      return res.status(201).json({
        success: true,
        data: newTeam,
        message: 'Team suggestion submitted (fallback mode)!',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}