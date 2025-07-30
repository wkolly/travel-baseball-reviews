import { Pool, Client } from 'pg';

// Database connection configuration for Neon
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
};

let pool: Pool | null = null;

// Get database connection pool
function getPool() {
  if (!pool) {
    pool = new Pool(dbConfig);
  }
  return pool;
}

// Initialize database tables - Skip since table already exists  
export async function initializeDatabase() {
  console.log('✅ Using existing database schema');
  
  // Ensure system user exists for foreign key constraints
  const pool = getPool();
  try {
    await pool.query(`
      INSERT INTO users (id, email, password, name, role, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO NOTHING
    `, [
      'system-user',
      'system@travelbaseballreview.com',
      'system-password-hash',
      'System User',
      'SYSTEM',
      new Date(),
      new Date()
    ]);
    console.log('✅ System user ensured');
  } catch (error) {
    console.error('Warning: Could not ensure system user exists:', error.message);
    // Don't throw - the user might already exist
  }
  
  return;
}

// Helper function to format team data for actual schema (camelCase)
function formatTeam(row: any) {
  // Parse ageGroups if it's a JSON string
  let ageGroups = row.ageGroups || '[]';
  if (typeof ageGroups === 'string') {
    try {
      ageGroups = JSON.parse(ageGroups);
    } catch (e) {
      console.warn('Failed to parse ageGroups JSON:', ageGroups);
      ageGroups = [];
    }
  }

  return {
    id: row.id,
    name: row.name,
    location: row.location,
    state: row.state,
    ageGroups: ageGroups,
    description: row.description || '',
    contact: row.contact || '',
    status: row.status,
    suggestedBy: row.suggestedBy,
    approvedBy: row.approvedBy,
    approvedAt: row.approvedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    user: {
      id: row.createdBy || 'system-user',
      name: row.contact || 'Team Contact',
      email: 'contact@example.com'
    },
    _count: { reviews: 0 }
  };
}

// Team operations using existing schema
export async function getAllTeams() {
  const pool = getPool();
  
  try {
    console.log('Executing getAllTeams query...');
    const result = await pool.query('SELECT * FROM teams ORDER BY "createdAt" DESC');
    console.log('Query result:', { rowCount: result.rows.length });
    
    const formattedTeams = result.rows.map(formatTeam);
    console.log('Formatted teams:', formattedTeams);
    
    return formattedTeams;
  } catch (error) {
    console.error('Error getting all teams:', error);
    console.error('Database URL check:', process.env.DATABASE_URL ? 'Set' : 'Not Set');
    
    // Return empty array instead of throwing to prevent crashes
    return [];
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
    console.log('Executing getPendingTeams query...');
    const result = await pool.query('SELECT * FROM teams WHERE status = $1 ORDER BY "createdAt" DESC', ['pending']);
    console.log('Pending query result:', { rowCount: result.rows.length });
    
    const formattedTeams = result.rows.map(formatTeam);
    console.log('Formatted pending teams:', formattedTeams);
    
    return formattedTeams;
  } catch (error) {
    console.error('Error getting pending teams:', error);
    console.error('Database URL check:', process.env.DATABASE_URL ? 'Set' : 'Not Set');
    
    // Return empty array instead of throwing to prevent crashes
    return [];
  }
}

export async function createTeam(teamData: any) {
  const pool = getPool();
  
  const newTeam = {
    id: String(Date.now()),
    name: teamData.name || 'New Team',
    location: teamData.location || 'Unknown',
    state: teamData.state || 'XX',
    ageGroups: typeof teamData.ageGroups === 'string' ? teamData.ageGroups : JSON.stringify(teamData.ageGroups || []),
    description: teamData.description || null,  // Can be null
    contact: teamData.contact || null,          // Can be null
    status: 'pending',
    createdBy: 'system-user'  // Use system user to satisfy foreign key constraint
  };

  try {
    await pool.query(`
      INSERT INTO teams (id, name, location, state, "ageGroups", description, contact, status, "createdBy")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      newTeam.id, newTeam.name, newTeam.location, newTeam.state, newTeam.ageGroups,
      newTeam.description, newTeam.contact, newTeam.status, newTeam.createdBy
    ]);

    // Fetch the created team to get timestamps
    const result = await pool.query('SELECT * FROM teams WHERE id = $1', [newTeam.id]);
    if (result.rows.length > 0) {
      return formatTeam(result.rows[0]);
    }

    // Fallback if fetch fails
    return {
      id: newTeam.id,
      name: newTeam.name,
      location: newTeam.location,
      state: newTeam.state,
      ageGroups: JSON.parse(newTeam.ageGroups),
      description: newTeam.description,
      contact: newTeam.contact,
      status: newTeam.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: newTeam.createdBy,
        name: newTeam.contact || 'Team Contact',
        email: 'contact@example.com'
      },
      _count: { reviews: 0 }
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

    // Update the team using actual schema
    await pool.query(`
      UPDATE teams 
      SET name = $1, location = $2, state = $3, "ageGroups" = $4, description = $5, status = $6, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $7
    `, [
      updates.name || currentTeam.name,
      updates.location || currentTeam.location,
      updates.state || currentTeam.state,
      typeof updates.ageGroups === 'string' ? updates.ageGroups : JSON.stringify(updates.ageGroups || currentTeam.ageGroups),
      updates.description || currentTeam.description,
      updates.status || currentTeam.status,
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

// Tournament operations - simplified for existing schema
export async function getAllTournaments() {
  // Return empty array since tournaments table may not exist in current schema
  return [];
}