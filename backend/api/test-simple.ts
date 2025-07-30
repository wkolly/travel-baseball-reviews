// Ultra-simple test endpoint that always works
export default function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('Simple test endpoint hit:', {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });

  // Return the exact structure the frontend expects for teams
  const mockResponse = {
    success: true,
    data: {
      teams: [
        {
          id: "test-1",
          name: "Test Team 1",
          location: "Test City",
          state: "TC",
          ageGroups: ["12U", "14U"],
          description: "Test team description",
          status: "pending",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          user: {
            id: "test-user",
            name: "Test User",
            email: "test@example.com"
          },
          _count: { reviews: 0 }
        }
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1
      }
    },
    message: "Simple test data retrieved successfully"
  };

  return res.status(200).json(mockResponse);
}