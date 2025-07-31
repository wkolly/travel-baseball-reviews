import { getAllTournaments, createTournament, initializeDatabase } from './postgres-db';

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

  console.log('Tournament request received:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin
  });

  // Handle GET requests
  if (req.method === 'GET') {
    try {
      await initializeDatabase();
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
        user: {
          id: 'fallback-user',
          name: 'Tournament Creator',
          email: 'creator@example.com'
        },
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