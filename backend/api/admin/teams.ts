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

  // Handle GET requests for all teams
  if (req.method === 'GET') {
    console.log('Admin teams request received');
    
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
            createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
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
            _count: { reviews: 2 }
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

  // Handle PUT requests for updating teams
  if (req.method === 'PUT') {
    const { url } = req;
    const teamIdMatch = url?.match(/\/admin\/teams\/([^\/\?]+)/);
    const teamId = teamIdMatch?.[1];
    
    console.log('Admin team update request for ID:', teamId, 'Data:', req.body);
    
    return res.status(200).json({
      success: true,
      data: {
        id: teamId,
        ...req.body,
        updatedAt: new Date().toISOString()
      },
      message: 'Team updated successfully'
    });
  }

  // Handle DELETE requests for deleting teams
  if (req.method === 'DELETE') {
    const { url } = req;
    const teamIdMatch = url?.match(/\/admin\/teams\/([^\/\?]+)/);
    const teamId = teamIdMatch?.[1];
    
    console.log('Admin team delete request for ID:', teamId);
    
    return res.status(200).json({
      success: true,
      message: 'Team deleted successfully'
    });
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}