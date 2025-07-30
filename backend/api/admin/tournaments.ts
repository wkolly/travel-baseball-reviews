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

  // Handle GET requests for all tournaments
  if (req.method === 'GET') {
    console.log('Admin tournaments request received');
    
    return res.status(200).json({
      success: true,
      data: {
        tournaments: [
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
            _count: { reviews: 1 }
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1
        }
      },
      message: 'Tournaments retrieved successfully'
    });
  }

  // Handle PUT requests for updating tournaments
  if (req.method === 'PUT') {
    const { url } = req;
    const tournamentIdMatch = url?.match(/\/admin\/tournaments\/([^\/\?]+)/);
    const tournamentId = tournamentIdMatch?.[1];
    
    console.log('Admin tournament update request for ID:', tournamentId, 'Data:', req.body);
    
    return res.status(200).json({
      success: true,
      data: {
        id: tournamentId,
        ...req.body,
        updatedAt: new Date().toISOString()
      },
      message: 'Tournament updated successfully'
    });
  }

  // Handle DELETE requests for deleting tournaments
  if (req.method === 'DELETE') {
    const { url } = req;
    const tournamentIdMatch = url?.match(/\/admin\/tournaments\/([^\/\?]+)/);
    const tournamentId = tournamentIdMatch?.[1];
    
    console.log('Admin tournament delete request for ID:', tournamentId);
    
    return res.status(200).json({
      success: true,
      message: 'Tournament deleted successfully'
    });
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}