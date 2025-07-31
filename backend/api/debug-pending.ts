import { Pool } from 'pg';

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    // Get raw pending teams data
    const rawResult = await pool.query('SELECT * FROM teams WHERE status = $1 LIMIT 5', ['pending']);
    
    // Check each team's ageGroups field
    const debugInfo = rawResult.rows.map(row => {
      let ageGroupsInfo = {
        raw: row.ageGroups,
        type: typeof row.ageGroups,
        isString: typeof row.ageGroups === 'string',
        length: row.ageGroups ? row.ageGroups.length : 0
      };

      // Try to parse if it's a string
      if (typeof row.ageGroups === 'string') {
        try {
          const parsed = JSON.parse(row.ageGroups);
          ageGroupsInfo.parsed = parsed;
          ageGroupsInfo.parseSuccess = true;
        } catch (e) {
          ageGroupsInfo.parseError = e.message;
          ageGroupsInfo.parseSuccess = false;
        }
      }

      return {
        id: row.id,
        name: row.name,
        ageGroupsDebug: ageGroupsInfo
      };
    });

    return res.status(200).json({
      message: 'Debug pending teams',
      totalRows: rawResult.rows.length,
      debugInfo: debugInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}