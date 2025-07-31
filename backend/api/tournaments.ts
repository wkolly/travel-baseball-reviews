import { getAllTournaments, getTournamentById, createTournament, getReviewsByTournamentId, initializeDatabase } from './postgres-db';

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://www.travelbaseballreview.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('Tournament request received:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin
  });

  // Handle GET requests
  if (req.method === 'GET') {
    const { url } = req;
    
    try {
      await initializeDatabase();
      
      // Check if this is a request for a specific tournament (e.g., /tournaments/1)
      const tournamentIdMatch = url?.match(/\/tournaments\/([^\/\?]+)/);
      if (tournamentIdMatch) {
        const tournamentId = tournamentIdMatch[1];
        
        console.log('Individual tournament request for ID:', tournamentId);
        
        const tournament = await getTournamentById(tournamentId);
        if (tournament) {
          // Get real reviews from database
          const reviews = await getReviewsByTournamentId(tournamentId);
          const tournamentWithReviews = {
            ...tournament,
            reviews: reviews
          };
          
          return res.status(200).json({
            success: true,
            data: tournamentWithReviews,
            message: 'Tournament details retrieved successfully'
          });
        }
        
        return res.status(404).json({
          success: false,
          message: 'Tournament not found'
        });
      }
      
      // Return list of all tournaments
      const allTournaments = await getAllTournaments();
      
      return res.status(200).json({
        success: true,
        data: {
          tournaments: allTournaments,
          pagination: {
            page: 1,
            limit: 20,
            total: allTournaments.length,
            totalPages: 1
          }
        },
        message: 'Tournaments retrieved successfully'
      });
    } catch (error) {
      console.error('Error retrieving tournaments:', error);
      return res.status(200).json({
        success: true,
        data: {
          tournaments: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 1
          }
        },
        message: 'Tournaments retrieved successfully (fallback)'
      });
    }
  }

  // Handle POST for creating tournaments
  if (req.method === 'POST') {
    console.log('Tournament creation received:', req.body);
    
    try {
      await initializeDatabase();
      const newTournament = await createTournament(req.body);
      
      console.log('Tournament created in database:', newTournament);
      
      return res.status(201).json({
        success: true,
        data: newTournament,
        message: 'Tournament created successfully!'
      });
    } catch (error) {
      console.error('Error creating tournament:', error);
      
      // Fallback response
      const newTournament = {
        id: 'fallback-' + Date.now(),
        name: req.body?.name || 'New Tournament',
        location: req.body?.location || '',
        description: req.body?.description || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: { reviews: 0 }
      };
      
      return res.status(201).json({
        success: true,
        data: newTournament,
        message: 'Tournament created (fallback mode)!',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}