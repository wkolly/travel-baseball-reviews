export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { Client } = await import('pg');
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    await client.connect();
    
    if (req.method === 'POST') {
      // Test inserting a team
      const testTeam = {
        id: 'test-' + Date.now(),
        name: 'Direct DB Test',
        location: 'Test City',
        state: 'TC',
        ageGroups: '["Test"]',
        description: 'Direct database test',
        contact: 'Test Contact',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'test-user'
      };
      
      await client.query(`
        INSERT INTO teams (id, name, location, state, "ageGroups", description, contact, status, "createdAt", "updatedAt", "createdBy")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        testTeam.id, testTeam.name, testTeam.location, testTeam.state, testTeam.ageGroups,
        testTeam.description, testTeam.contact, testTeam.status, testTeam.createdAt,
        testTeam.updatedAt, testTeam.createdBy
      ]);
      
      await client.end();
      
      return res.status(200).json({
        success: true,
        data: testTeam,
        message: 'Direct database insert successful'
      });
    }
    
    // GET request - show existing teams
    const result = await client.query('SELECT * FROM teams ORDER BY "createdAt" DESC LIMIT 5');
    await client.end();
    
    return res.status(200).json({
      success: true,
      data: {
        teams: result.rows,
        count: result.rows.length
      },
      message: 'Direct database query successful'
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code,
      detail: (error as any)?.detail,
      message: 'Direct database test failed'
    });
  }
}