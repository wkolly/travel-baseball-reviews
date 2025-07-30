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

  // Only handle POST for login
  if (req.method === 'POST') {
    const { email, password } = req.body || {};
    
    console.log('Login attempt:', { 
      email, 
      password: password ? '***' : 'missing',
      body: req.body,
      headers: req.headers['content-type']
    });
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Check if admin user
    const isAdmin = email === 'admin@travelballhub.com';
    
    // Accept any login
    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: isAdmin ? 'admin-user' : 'user-123',
          email: email,
          name: isAdmin ? 'Admin' : email.split('@')[0],
          role: isAdmin ? 'ADMIN' : 'USER',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        token: 'mock-jwt-token-' + Date.now()
      },
      message: 'Login successful'
    });
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'Login endpoint is working',
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}