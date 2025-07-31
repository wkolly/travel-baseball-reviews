export default function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://www.travelbaseballreview.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req;

  // Minimal pending teams endpoint
  if (url?.includes('pending-teams')) {
    return res.status(200).json({
      success: true,
      data: {
        teams: [
          {
            id: "test-1",
            name: "Test Team 1",
            location: "Test City",
            state: "TX",
            ageGroups: "[\"12U\"]",  // Try as JSON string
            description: "Test team",
            status: "pending",
            createdAt: "2025-07-31T10:00:00.000Z",
            updatedAt: "2025-07-31T10:00:00.000Z",
            suggestedBy: null,
            approvedBy: null,
            approvedAt: null,
            contact: null,
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
      message: "Pending teams retrieved successfully"
    });
  }

  // Minimal stats endpoint
  if (url?.includes('stats')) {
    return res.status(200).json({
      success: true,
      data: {
        totalTeams: 1,
        approvedTeams: 0,
        pendingTeams: 1,
        totalTournaments: 0,
        totalUsers: 1
      },
      message: "Stats retrieved successfully"
    });
  }

  return res.status(404).json({
    success: false,
    message: 'Admin endpoint not found'
  });
}