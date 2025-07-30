import { Pool, Client } from 'pg';

// Database connection configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
};

let pool: Pool | null = null;

// Get database connection pool
function getPool() {
  if (!pool) {
    pool = new Pool(dbConfig);
  }
  return pool;
}

// Initialize database tables
export async function initializeDatabase() {
  console.log('Attempting database connection...');
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('Database config:', { 
    hasConnectionString: !!dbConfig.connectionString,
    ssl: dbConfig.ssl 
  });
  
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL database successfully');

    // Create teams table
    await client.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT,
        state TEXT,
        age_groups TEXT,
        description TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id TEXT,
        user_name TEXT,
        user_email TEXT,
        review_count INTEGER DEFAULT 0
      )
    `);

    // Create tournaments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tournaments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        age_groups TEXT,
        description TEXT,
        entry_fee INTEGER,
        max_teams INTEGER,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id TEXT,
        user_name TEXT,
        user_email TEXT,
        review_count INTEGER DEFAULT 0
      )
    `);

    // Insert default teams if none exist
    const teamCount = await client.query('SELECT COUNT(*) FROM teams');
    if (parseInt(teamCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO teams (id, name, location, state, age_groups, description, status, created_at, updated_at, user_id, user_name, user_email, review_count)
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13),
        ($14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26),
        ($27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39)
      `, [
        '1', 'Atlanta Thunder', 'Atlanta', 'GA', '["12U", "14U"]', 'Competitive travel baseball team', 'approved',
        new Date(Date.now() - 30 * 86400000), new Date(Date.now() - 7 * 86400000),
        'user-1', 'Coach Thompson', 'coach@atlantathunder.com', 3,
        
        '2', 'Dallas Diamonds', 'Dallas', 'TX', '["10U", "12U"]', 'Premier youth baseball organization', 'approved',
        new Date(Date.now() - 20 * 86400000), new Date(Date.now() - 5 * 86400000),
        'user-2', 'Manager Davis', 'manager@dallasdiamonds.com', 2,
        
        '3', 'Houston Heat', 'Houston', 'TX', '["14U", "16U"]', 'Competitive baseball team focused on player development', 'pending',
        new Date(Date.now() - 15 * 86400000), new Date(Date.now() - 2 * 86400000),
        'user-3', 'Director Martinez', 'director@houstonheat.com', 0
      ]);
    }

    // Insert default tournaments if none exist
    const tournamentCount = await client.query('SELECT COUNT(*) FROM tournaments');
    if (parseInt(tournamentCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO tournaments (id, name, location, start_date, end_date, age_groups, description, entry_fee, max_teams, status, created_at, updated_at, user_id, user_name, user_email, review_count)
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16),
        ($17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32)
      `, [
        '1', 'Summer Championship Series', 'Orlando, FL',
        new Date(Date.now() + 30 * 86400000), new Date(Date.now() + 32 * 86400000),
        '["12U", "14U", "16U"]', 'Premier summer tournament featuring top teams from across the Southeast',
        850, 32, 'active',
        new Date(Date.now() - 60 * 86400000), new Date(Date.now() - 10 * 86400000),
        'user-1', 'Tournament Director', 'director@summerseries.com', 1,
        
        '2', 'Fall Classic Tournament', 'Phoenix, AZ',
        new Date(Date.now() + 60 * 86400000), new Date(Date.now() + 62 * 86400000),
        '["10U", "12U", "14U"]', 'Annual fall tournament with excellent facilities',
        750, 24, 'active',
        new Date(Date.now() - 45 * 86400000), new Date(Date.now() - 5 * 86400000),
        'user-2', 'Classic Organizer', 'organizer@fallclassic.com', 2
      ]);
    }

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code,
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  } finally {
    await client.end();
  }
}

// Helper function to format team data
function formatTeam(row: any) {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    state: row.state,
    ageGroups: row.age_groups,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    user: {
      id: row.user_id,
      name: row.user_name,
      email: row.user_email
    },
    _count: { reviews: row.review_count }
  };
}

// Team operations
export async function getAllTeams() {
  const pool = getPool();
  
  try {
    const result = await pool.query('SELECT * FROM teams ORDER BY created_at DESC');
    return result.rows.map(formatTeam);
  } catch (error) {
    console.error('Error getting all teams:', error);
    throw error;
  }
}

export async function getTeamById(id: string) {
  const pool = getPool();
  
  try {
    const result = await pool.query('SELECT * FROM teams WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    
    return formatTeam(result.rows[0]);
  } catch (error) {
    console.error('Error getting team by id:', error);
    throw error;
  }
}

export async function getPendingTeams() {
  const pool = getPool();
  
  try {
    const result = await pool.query('SELECT * FROM teams WHERE status = $1 ORDER BY created_at DESC', ['pending']);
    return result.rows.map(formatTeam);
  } catch (error) {
    console.error('Error getting pending teams:', error);
    throw error;
  }
}

export async function createTeam(teamData: any) {
  const pool = getPool();
  
  const newTeam = {
    id: String(Date.now()),
    name: teamData.name || 'New Team',
    location: teamData.location || '',
    state: teamData.state || '',
    ageGroups: teamData.ageGroups || '[]',
    description: teamData.description || '',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'user-' + Date.now(),
    userName: teamData.contact || 'Team Contact',
    userEmail: teamData.email || 'contact@example.com',
    reviewCount: 0
  };

  try {
    await pool.query(`
      INSERT INTO teams (id, name, location, state, age_groups, description, status, created_at, updated_at, user_id, user_name, user_email, review_count)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      newTeam.id, newTeam.name, newTeam.location, newTeam.state, newTeam.ageGroups,
      newTeam.description, newTeam.status, newTeam.createdAt, newTeam.updatedAt,
      newTeam.userId, newTeam.userName, newTeam.userEmail, newTeam.reviewCount
    ]);

    return {
      id: newTeam.id,
      name: newTeam.name,
      location: newTeam.location,
      state: newTeam.state,
      ageGroups: newTeam.ageGroups,
      description: newTeam.description,
      status: newTeam.status,
      createdAt: newTeam.createdAt,
      updatedAt: newTeam.updatedAt,
      user: {
        id: newTeam.userId,
        name: newTeam.userName,
        email: newTeam.userEmail
      },
      _count: { reviews: newTeam.reviewCount }
    };
  } catch (error) {
    console.error('Error creating team:', error);
    throw error;
  }
}

export async function updateTeam(id: string, updates: any) {
  const pool = getPool();
  
  try {
    // Get current team
    const currentTeam = await getTeamById(id);
    if (!currentTeam) return null;

    // Update the team
    await pool.query(`
      UPDATE teams 
      SET name = $1, location = $2, state = $3, age_groups = $4, description = $5, status = $6, updated_at = $7
      WHERE id = $8
    `, [
      updates.name || currentTeam.name,
      updates.location || currentTeam.location,
      updates.state || currentTeam.state,
      updates.ageGroups || currentTeam.ageGroups,
      updates.description || currentTeam.description,
      updates.status || currentTeam.status,
      new Date(),
      id
    ]);

    // Return updated team
    return await getTeamById(id);
  } catch (error) {
    console.error('Error updating team:', error);
    throw error;
  }
}

export async function deleteTeam(id: string) {
  const pool = getPool();
  
  try {
    // Get team before deletion
    const team = await getTeamById(id);
    if (!team) return null;

    // Delete the team
    await pool.query('DELETE FROM teams WHERE id = $1', [id]);
    
    return team;
  } catch (error) {
    console.error('Error deleting team:', error);
    throw error;
  }
}

export async function approveTeam(id: string) {
  return await updateTeam(id, { status: 'approved' });
}

export async function rejectTeam(id: string) {
  return await deleteTeam(id);
}

export async function getTeamStats() {
  const pool = getPool();
  
  try {
    const totalResult = await pool.query('SELECT COUNT(*) FROM teams');
    const approvedResult = await pool.query('SELECT COUNT(*) FROM teams WHERE status = $1', ['approved']);
    const pendingResult = await pool.query('SELECT COUNT(*) FROM teams WHERE status = $1', ['pending']);

    return {
      total: parseInt(totalResult.rows[0].count),
      approved: parseInt(approvedResult.rows[0].count),
      pending: parseInt(pendingResult.rows[0].count)
    };
  } catch (error) {
    console.error('Error getting team stats:', error);
    throw error;
  }
}

// Tournament operations
export async function getAllTournaments() {
  const pool = getPool();
  
  try {
    const result = await pool.query('SELECT * FROM tournaments ORDER BY created_at DESC');
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      location: row.location,
      startDate: row.start_date,
      endDate: row.end_date,
      ageGroups: row.age_groups,
      description: row.description,
      entryFee: row.entry_fee,
      maxTeams: row.max_teams,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      user: {
        id: row.user_id,
        name: row.user_name,
        email: row.user_email
      },
      _count: { reviews: row.review_count }
    }));
  } catch (error) {
    console.error('Error getting all tournaments:', error);
    throw error;
  }
}