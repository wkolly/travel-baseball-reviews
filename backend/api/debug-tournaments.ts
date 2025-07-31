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

    // Check tournament table schema
    const schemaResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'tournaments' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);

    // Get sample tournament data
    const sampleResult = await pool.query('SELECT * FROM tournaments LIMIT 3');

    return res.status(200).json({
      message: 'Tournament debug info',
      schema: schemaResult.rows,
      sampleData: sampleResult.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}