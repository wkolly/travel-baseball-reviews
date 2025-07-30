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
  console.log('Team reviews request received:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin
  });

  // Handle GET requests for team reviews
  if (req.method === 'GET') {
    const { url } = req;
    
    // Extract team ID from URL
    const teamIdMatch = url?.match(/\/team-reviews\/([^\/\?]+)/) || url?.match(/team-reviews\?.*teamId=([^&]+)/);
    const teamId = teamIdMatch?.[1] || '1';
    
    console.log('Team reviews for team ID:', teamId);
    
    // Return team reviews
    return res.status(200).json({
      success: true,
      data: {
        reviews: [
          { 
            id: '1', 
            teamId: teamId,
            userId: null,
            overall_rating: 4.2, 
            coaching_rating: 4, 
            value_rating: 4, 
            organization_rating: 5, 
            playing_time_rating: 4, 
            comment: 'Great coaching staff and well organized team.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          { 
            id: '2', 
            teamId: teamId,
            userId: null,
            overall_rating: 4.8, 
            coaching_rating: 5, 
            value_rating: 4, 
            organization_rating: 5, 
            playing_time_rating: 5,
            comment: 'Excellent team with great player development.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          { 
            id: '3', 
            teamId: teamId,
            userId: null,
            overall_rating: 4.0, 
            coaching_rating: 4, 
            value_rating: 4, 
            organization_rating: 4, 
            playing_time_rating: 4,
            comment: 'Solid team with good opportunities for kids.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      },
      message: 'Team reviews retrieved successfully'
    });
  }

  // Handle POST for creating reviews
  if (req.method === 'POST') {
    const { coaching_rating, value_rating, organization_rating, playing_time_rating, overall_rating, comment } = req.body || {};
    
    return res.status(201).json({
      success: true,
      data: {
        id: 'new-review-' + Date.now(),
        coaching_rating: coaching_rating || 5,
        value_rating: value_rating || 5,
        organization_rating: organization_rating || 5,
        playing_time_rating: playing_time_rating || 5,
        overall_rating: overall_rating || 5,
        comment: comment || '',
        createdAt: new Date().toISOString()
      },
      message: 'Team review created successfully'
    });
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}