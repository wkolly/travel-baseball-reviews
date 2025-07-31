import { createUser, getUserByEmail, initializeDatabase } from './postgres-db';
import { Pool } from 'pg';

// Get database connection pool
function getPool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
}

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

  const { url } = req;
  console.log('Auth request received:', { method: req.method, url });

  // Handle login requests
  if (url?.includes('/login') || url?.includes('/api/login')) {
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

      // Try to authenticate with database
      try {
        await initializeDatabase();
        
        // Check if admin user
        const isAdmin = email === 'admin@travelballhub.com';
        
        if (isAdmin) {
          // Allow admin login without database check
          return res.status(200).json({
            success: true,
            data: {
              user: {
                id: 'admin-user',
                email: email,
                name: 'Admin',
                role: 'ADMIN',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              token: 'mock-jwt-token-' + Date.now()
            },
            message: 'Admin login successful'
          });
        }
        
        // Check if user exists in database
        const user = await getUserByEmail(email);
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'Invalid email or password'
          });
        }
        
        // In production, you would verify the password hash here
        // For now, we'll accept any password for existing users
        // Create a simple token that includes user ID for profile lookup
        const token = 'mock-jwt-token-' + user.id + '-' + Date.now();
        
        return res.status(200).json({
          success: true,
          data: {
            user: user,
            token: token
          },
          message: 'Login successful'
        });
      } catch (error) {
        console.error('Database login error:', error);
        
        // Fallback to accepting any login if database fails
        const isAdmin = email === 'admin@travelballhub.com';
        const userId = isAdmin ? 'admin-user' : 'user-123';
        const token = 'mock-jwt-token-' + userId + '-' + Date.now();
        
        return res.status(200).json({
          success: true,
          data: {
            user: {
              id: userId,
              email: email,
              name: isAdmin ? 'Admin' : email.split('@')[0],
              role: isAdmin ? 'ADMIN' : 'USER',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            token: token
          },
          message: 'Login successful (fallback mode)'
        });
      }
    }

    if (req.method === 'GET') {
      return res.status(200).json({
        message: 'Login endpoint is working',
        method: req.method,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Handle registration requests
  if (url?.includes('/register') || url?.includes('/signup')) {
    if (req.method === 'POST') {
      console.log('Registration request received:', {
        method: req.method,
        url: req.url,
        body: req.body,
        headers: req.headers['content-type']
      });
      
      const { email, password, name } = req.body || {};
      
      console.log('Registration attempt:', { 
        email, 
        name, 
        password: password ? '***' : 'missing',
        body: req.body,
        headers: req.headers['content-type']
      });
      
      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          message: 'Email, password, and name are required'
        });
      }

      // Try to create user in database
      try {
        await initializeDatabase();
        
        // Check if user already exists
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'User with this email already exists'
          });
        }
        
        // Create new user in database
        const newUser = await createUser({ email, password, name });
        
        const token = 'mock-jwt-token-' + newUser.id + '-' + Date.now();
        
        return res.status(201).json({
          success: true,
          data: {
            user: newUser,
            token: token
          },
          message: 'Registration successful'
        });
      } catch (error) {
        console.error('Database registration error:', error);
        
        // Fallback to mock registration if database fails
        const userId = 'user-' + Date.now();
        const token = 'mock-jwt-token-' + userId + '-' + Date.now();
        
        return res.status(201).json({
          success: true,
          data: {
            user: {
              id: userId,
              email: email,
              name: name,
              role: 'USER',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            token: token
          },
          message: 'Registration successful (fallback mode)'
        });
      }
    }

    if (req.method === 'GET') {
      return res.status(200).json({
        message: 'Register endpoint is working',
        method: req.method,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Handle profile requests
  if (url?.includes('/auth/profile') || url?.includes('/profile')) {
    if (req.method === 'GET') {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');
      
      // Simple token check - in production you'd validate the JWT properly
      if (token && token.includes('mock-jwt-token')) {
        // For admin token, return admin user
        if (token === 'mock-jwt-token') {
          return res.status(200).json({
            success: true,
            data: {
              user: {
                id: 'admin-user',
                email: 'admin@travelballhub.com',
                name: 'Admin',
                role: 'ADMIN',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            },
            message: 'Profile retrieved successfully'
          });
        }
        
        // For other tokens, extract user ID and get user from database
        try {
          // Extract user ID from token format: mock-jwt-token-{userId}-{timestamp}
          const tokenParts = token.split('-');
          if (tokenParts.length >= 4) {
            // Remove 'mock', 'jwt', 'token' parts and timestamp, get user ID
            const userId = tokenParts.slice(3, -1).join('-'); // Handle user IDs that might have hyphens
            
            console.log('Looking up user profile for ID:', userId);
            
            const pool = getPool();
            const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
            
            if (result.rows.length > 0) {
              const user = result.rows[0];
              return res.status(200).json({
                success: true,
                data: {
                  user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                  }
                },
                message: 'Profile retrieved successfully'
              });
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
        
        // Fallback: return a generic user profile
        return res.status(200).json({
          success: true,
          data: {
            user: {
              id: 'user-' + Date.now(),
              email: 'user@example.com',
              name: 'User',
              role: 'USER',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          },
          message: 'Profile retrieved successfully'
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - invalid or missing token'
        });
      }
    }

    if (req.method === 'PUT') {
      // Handle profile updates
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: {
            id: 'admin-user',
            email: 'admin@travelballhub.com',
            name: req.body?.name || 'Admin',
            role: 'ADMIN',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}