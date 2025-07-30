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

  // Only handle GET for users list
  if (req.method === 'GET') {
    console.log('Admin users request received');
    
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

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}