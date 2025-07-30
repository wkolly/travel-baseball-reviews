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

  const { url } = req;

  // Handle login - POST /api/auth/login
  if (req.method === 'POST' && (url?.includes('/login') || url?.endsWith('/auth'))) {
    const { email, password } = req.body || {};
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Mock authentication - in real app, verify against database
    if (email && password) {
      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: 'user-123',
            email: email,
            name: email.split('@')[0],
            role: email.includes('admin') ? 'ADMIN' : 'USER',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          token: 'mock-jwt-token-' + Date.now()
        },
        message: 'Login successful'
      });
    }
  }

  // Handle registration - POST /api/auth/register
  if (req.method === 'POST' && url?.includes('/register')) {
    const { email, password, name } = req.body || {};
    
    // Basic validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
    }

    // Mock registration - in real app, save to database
    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: 'user-' + Date.now(),
          email: email,
          name: name,
          role: 'USER',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        token: 'mock-jwt-token-' + Date.now()
      },
      message: 'Registration successful'
    });
  }

  // Handle logout - POST /api/auth/logout
  if (req.method === 'POST' && url?.includes('/logout')) {
    return res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  }

  // Handle user profile - GET /api/auth/me
  if (req.method === 'GET' && (url?.includes('/me') || url?.endsWith('/auth'))) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Mock user profile
    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: 'user-123',
          email: 'user@example.com',
          name: 'Mock User',
          role: 'USER',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      },
      message: 'User profile retrieved'
    });
  }

  return res.status(404).json({
    success: false,
    message: 'Auth endpoint not found'
  });
}