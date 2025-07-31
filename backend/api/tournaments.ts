export default function handler(req: any, res: any) {
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
      message: 'Tournaments retrieved successfully (simple version)'
    });
  }

  // Handle POST for creating tournaments
  if (req.method === 'POST') {
    console.log('Tournament creation received:', req.body);
    
    // Simple response without database for now
    const newTournament = {
      id: 'simple-' + Date.now(),
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
      message: 'Tournament created successfully (simple version)!'
    });
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}