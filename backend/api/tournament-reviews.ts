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

  // Log the request for debugging
  console.log('Tournament reviews request received:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin
  });

  // Handle GET requests for tournament reviews
  if (req.method === 'GET') {
    const { url } = req;
    
    // Extract tournament ID from URL
    const tournamentIdMatch = url?.match(/\/tournament-reviews\/([^\/\?]+)/) || url?.match(/tournament-reviews\?.*tournamentId=([^&]+)/);
    const tournamentId = tournamentIdMatch?.[1] || '1';
    
    console.log('Tournament reviews for tournament ID:', tournamentId);
    
    // Return tournament reviews
    return res.status(200).json({
      success: true,
      data: {
        reviews: [
          {
            id: '1',
            tournamentId: tournamentId,
            userId: null,
            overall_rating: 4.5,
            rating: 4.5,
            overallRating: 4.5,
            comment: 'Great tournament organization and facilities',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            tournamentId: tournamentId,
            userId: null,
            overall_rating: 5.0,
            rating: 5.0,
            overallRating: 5.0,
            comment: 'Excellent competition and well run event',  
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '3',
            tournamentId: tournamentId,
            userId: null,
            overall_rating: 4.0,
            rating: 4.0,
            overallRating: 4.0,
            comment: 'Good tournament overall, nice fields',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      },
      message: 'Tournament reviews retrieved successfully'
    });
  }

  // Handle POST for creating reviews
  if (req.method === 'POST') {
    const { overall_rating, comment } = req.body || {};
    
    return res.status(201).json({
      success: true,
      data: {
        id: 'new-review-' + Date.now(),
        overall_rating: overall_rating || 5,
        comment: comment || '',
        createdAt: new Date().toISOString()
      },
      message: 'Tournament review created successfully'
    });
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}