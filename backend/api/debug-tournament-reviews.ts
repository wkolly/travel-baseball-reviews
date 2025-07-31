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

    // Get all tournament reviews with their ratings
    const reviewsResult = await pool.query(`
      SELECT tr."tournamentId", tr.overall_rating, tr.comment, tr."createdAt",
             t.name as tournament_name
      FROM tournament_reviews tr
      LEFT JOIN tournaments t ON tr."tournamentId" = t.id
      ORDER BY tr."tournamentId", tr."createdAt" DESC
    `);

    // Group by tournament and calculate averages
    const tournamentStats = {};
    reviewsResult.rows.forEach(review => {
      const tournamentId = review.tournamentId;
      if (!tournamentStats[tournamentId]) {
        tournamentStats[tournamentId] = {
          tournament_name: review.tournament_name,
          reviews: [],
          sum: 0,
          count: 0
        };
      }
      
      tournamentStats[tournamentId].reviews.push({
        rating: review.overall_rating,
        comment: review.comment,
        createdAt: review.createdAt
      });
      
      tournamentStats[tournamentId].sum += review.overall_rating;
      tournamentStats[tournamentId].count += 1;
    });

    // Calculate averages
    Object.keys(tournamentStats).forEach(tournamentId => {
      const stats = tournamentStats[tournamentId];
      stats.calculated_average = stats.count > 0 ? stats.sum / stats.count : 0;
    });

    // Also get what the database query returns
    const dbQueryResult = await pool.query(`
      SELECT t.id, t.name,
             COUNT(tr.id)::text AS review_count,
             COALESCE(AVG(tr.overall_rating), 0)::text AS average_rating
      FROM tournaments t
      LEFT JOIN tournament_reviews tr ON t.id = tr."tournamentId"
      GROUP BY t.id, t.name
      HAVING COUNT(tr.id) > 0
      ORDER BY t.name
    `);

    return res.status(200).json({
      message: 'Tournament reviews debug data',
      manual_calculation: tournamentStats,
      database_query_result: dbQueryResult.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}