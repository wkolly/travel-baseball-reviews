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
    // First check what columns exist in users table
    const userColumnsResult = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    const userColumns = userColumnsResult.rows.map(row => row.column_name);
    console.log('Users table columns:', userColumns);
    
    // Create system user with required fields
    if (userColumns.includes('password') && userColumns.includes('role')) {
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
    } else {
      // Fallback with minimal fields
      await pool.query(`
        INSERT INTO users (id, email, name, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO NOTHING
      `, [
        'system-user',
        'system@travelbaseballreview.com',
        'System User',
        new Date(),
        new Date()
      ]);
    }
    
    console.log('✅ System user ensured in production database');
  } catch (error) {
    console.error('Warning: Could not ensure system user exists:', error.message);
    console.error('Error details:', error);
    // Don't throw - continue anyway
  }
  
  return;
}

// Helper function to format team data for actual schema (camelCase)
function formatTeam(row: any) {
  // Keep ageGroups as JSON string for frontend compatibility
  let ageGroups = row.ageGroups || '[]';
  // Don't parse it - frontend expects JSON string
  if (typeof ageGroups !== 'string') {
    ageGroups = JSON.stringify(ageGroups);
  }

  const avgRating = row.average_rating ? parseFloat(row.average_rating) : 0;

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
    // Add rating properties that frontend expects
    averageRating: avgRating,
    avgRating: avgRating,
    rating: avgRating,
    overallRating: avgRating,
    user: {
      id: row.createdBy || 'system-user',
      name: row.contact || 'Team Contact',
      email: 'contact@example.com'
    },
    _count: { reviews: row.review_count ? parseInt(row.review_count) : 0 }
  };
}

// Team operations using existing schema
export async function getAllTeams() {
  const pool = getPool();
  
  try {
    console.log('Executing getAllTeams query with review counts and average ratings...');
    const result = await pool.query(`
      SELECT t.*, 
             COUNT(r.id)::text AS review_count,
             COALESCE(AVG(r.overall_rating), 0)::text AS average_rating
      FROM teams t
      LEFT JOIN reviews r ON t.id = r."teamId"
      GROUP BY t.id, t.name, t.location, t.state, t."ageGroups", t.description, t.contact, t.status, t."suggestedBy", t."approvedBy", t."approvedAt", t."createdBy", t."createdAt", t."updatedAt"
      ORDER BY t."createdAt" DESC
    `);
    console.log('Query result:', { rowCount: result.rows.length });
    
    const formattedTeams = result.rows.map(formatTeam);
    console.log('Formatted teams with review counts and ratings:', formattedTeams);
    
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
    ageGroups: JSON.stringify(Array.isArray(teamData.ageGroups) ? teamData.ageGroups : (teamData.ageGroups ? [teamData.ageGroups] : [])),
    description: teamData.description || null,  // Can be null
    contact: teamData.contact || null,          // Can be null
    status: 'pending',
    createdBy: 'system-user'  // Use system user to satisfy foreign key constraint
  };

  try {
    await pool.query(`
      INSERT INTO teams (id, name, location, state, "ageGroups", description, contact, status, "createdBy", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      newTeam.id, newTeam.name, newTeam.location, newTeam.state, newTeam.ageGroups,
      newTeam.description, newTeam.contact, newTeam.status, newTeam.createdBy,
      new Date(), new Date()
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

// Tournament operations using actual schema
export async function getAllTournaments() {
  const pool = getPool();
  
  try {
    console.log('Executing getAllTournaments query with review counts and average ratings...');
    const result = await pool.query(`
      SELECT t.*, 
             COUNT(tr.id)::text AS review_count,
             COALESCE(AVG(tr.overall_rating), 0)::text AS average_rating
      FROM tournaments t
      LEFT JOIN tournament_reviews tr ON t.id = tr."tournamentId"
      GROUP BY t.id, t.name, t.location, t.description, t."createdBy", t."createdAt", t."updatedAt"
      ORDER BY t."createdAt" DESC
    `);
    console.log('Tournaments query result:', { rowCount: result.rows.length });
    
    const formattedTournaments = result.rows.map(formatTournament);
    console.log('Formatted tournaments with review counts and ratings:', formattedTournaments);
    
    return formattedTournaments;
  } catch (error) {
    console.error('Error getting all tournaments:', error);
    console.error('Database URL check:', process.env.DATABASE_URL ? 'Set' : 'Not Set');
    
    // Return empty array instead of throwing to prevent crashes
    return [];
  }
}

export async function getTournamentById(id: string) {
  const pool = getPool();
  
  try {
    const result = await pool.query('SELECT * FROM tournaments WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    
    return formatTournament(result.rows[0]);
  } catch (error) {
    console.error('Error getting tournament by id:', error);
    throw error;
  }
}

export async function createTournament(tournamentData: any) {
  const pool = getPool();
  
  const newTournament = {
    id: String(Date.now()),
    name: tournamentData.name || 'New Tournament',
    location: tournamentData.location || 'Unknown',
    description: tournamentData.description || null,  // Can be null
    createdBy: 'system-user'  // Use system user to satisfy foreign key constraint
  };

  try {
    await pool.query(`
      INSERT INTO tournaments (id, name, location, description, "createdBy", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      newTournament.id, newTournament.name, newTournament.location,
      newTournament.description, newTournament.createdBy,
      new Date(), new Date()
    ]);

    // Fetch the created tournament to get timestamps
    const result = await pool.query('SELECT * FROM tournaments WHERE id = $1', [newTournament.id]);
    if (result.rows.length > 0) {
      return formatTournament(result.rows[0]);
    }

    // Fallback if fetch fails
    return {
      id: newTournament.id,
      name: newTournament.name,
      location: newTournament.location,
      description: newTournament.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: newTournament.createdBy,
        name: 'System User',
        email: 'system@travelbaseballreview.com'
      },
      _count: { reviews: 0 }
    };
  } catch (error) {
    console.error('Error creating tournament:', error);
    throw error;
  }
}

// Helper function to format tournament data
function formatTournament(row: any) {
  const avgRating = row.average_rating ? parseFloat(row.average_rating) : 0;
  
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    description: row.description || '',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    // Add rating properties that frontend expects - all should be the same value
    averageRating: avgRating,
    avgRating: avgRating,
    rating: avgRating,
    overallRating: avgRating,
    user: {
      id: row.createdBy || 'system-user',
      name: 'Tournament Creator',
      email: 'creator@example.com'
    },
    _count: { reviews: row.review_count ? parseInt(row.review_count) : 0 },
    // Add empty reviews array for compatibility
    reviews: []
  };
}

// User operations
export async function createUser(userData: any) {
  const pool = getPool();
  
  const newUser = {
    id: 'user-' + Date.now(),
    email: userData.email,
    password: userData.password, // In production, this should be hashed
    name: userData.name,
    role: 'USER'
  };

  try {
    await pool.query(`
      INSERT INTO users (id, email, password, name, role, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      newUser.id, newUser.email, newUser.password, newUser.name, newUser.role,
      new Date(), new Date()
    ]);

    // Fetch the created user to get timestamps
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [newUser.id]);
    if (result.rows.length > 0) {
      return formatUser(result.rows[0]);
    }

    // Fallback if fetch fails
    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function getAllUsers() {
  const pool = getPool();
  
  try {
    console.log('Executing getAllUsers query...');
    const result = await pool.query('SELECT * FROM users ORDER BY "createdAt" DESC');
    console.log('Users query result:', { rowCount: result.rows.length });
    
    const formattedUsers = result.rows.map(user => ({
      ...formatUser(user),
      _count: { reviews: 0 } // TODO: Add actual review count when reviews are implemented
    }));
    console.log('Formatted users:', formattedUsers);
    
    return formattedUsers;
  } catch (error) {
    console.error('Error getting all users:', error);
    console.error('Database URL check:', process.env.DATABASE_URL ? 'Set' : 'Not Set');
    
    // Return empty array instead of throwing to prevent crashes
    return [];
  }
}

export async function getUserByEmail(email: string) {
  const pool = getPool();
  
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return null;
    
    return formatUser(result.rows[0]);
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
}

// Helper function to format user data
function formatUser(row: any) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

// Review operations
export async function createTeamReview(reviewData: any) {
  const pool = getPool();
  
  const newReview = {
    id: 'review-' + Date.now(),
    teamId: reviewData.teamId,
    userId: reviewData.userId || null, // Can be null for anonymous reviews
    coaching_rating: parseInt(reviewData.coaching_rating) || 1,
    value_rating: parseInt(reviewData.value_rating) || 1,
    organization_rating: parseInt(reviewData.organization_rating) || 1,
    playing_time_rating: parseInt(reviewData.playing_time_rating) || 1,
    overall_rating: parseFloat(reviewData.overall_rating) || 1.0,
    comment: reviewData.comment || null
  };

  try {
    await pool.query(`
      INSERT INTO reviews (id, "teamId", "userId", coaching_rating, value_rating, organization_rating, playing_time_rating, overall_rating, comment, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      newReview.id, newReview.teamId, newReview.userId, newReview.coaching_rating,
      newReview.value_rating, newReview.organization_rating, newReview.playing_time_rating,
      newReview.overall_rating, newReview.comment, new Date(), new Date()
    ]);

    // Fetch the created review to get timestamps
    const result = await pool.query('SELECT * FROM reviews WHERE id = $1', [newReview.id]);
    if (result.rows.length > 0) {
      return formatReview(result.rows[0]);
    }

    // Fallback if fetch fails
    return {
      ...newReview,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
}

export async function getReviewsByTeamId(teamId: string) {
  const pool = getPool();
  
  try {
    console.log('Fetching reviews for team:', teamId);
    const result = await pool.query('SELECT * FROM reviews WHERE "teamId" = $1 ORDER BY "createdAt" DESC', [teamId]);
    console.log('Reviews query result:', { rowCount: result.rows.length });
    
    const formattedReviews = result.rows.map(formatReview);
    console.log('Formatted reviews:', formattedReviews);
    
    return formattedReviews;
  } catch (error) {
    console.error('Error getting reviews by team id:', error);
    return [];
  }
}

export async function getAllReviews() {
  const pool = getPool();
  
  try {
    console.log('Executing getAllReviews query...');
    const result = await pool.query('SELECT * FROM reviews ORDER BY "createdAt" DESC');
    console.log('All reviews query result:', { rowCount: result.rows.length });
    
    const formattedReviews = result.rows.map(formatReview);
    console.log('Formatted reviews:', formattedReviews);
    
    return formattedReviews;
  } catch (error) {
    console.error('Error getting all reviews:', error);
    return [];
  }
}

// Helper function to format review data
function formatReview(row: any) {
  return {
    id: row.id,
    teamId: row.teamId,
    userId: row.userId,
    coaching_rating: row.coaching_rating,
    value_rating: row.value_rating,
    organization_rating: row.organization_rating,
    playing_time_rating: row.playing_time_rating,
    overall_rating: row.overall_rating,
    comment: row.comment,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    // Add user info if userId exists (will need to join with users table later)
    user: row.userId ? {
      id: row.userId,
      name: 'User', // TODO: Join with users table to get actual name
      email: 'user@example.com'
    } : null
  };
}

// Tournament Review operations
export async function createTournamentReview(reviewData: any) {
  const pool = getPool();
  
  const newReview = {
    id: 'tournament-review-' + Date.now(),
    tournamentId: reviewData.tournamentId,
    userId: reviewData.userId || null, // Can be null for anonymous reviews
    overall_rating: parseFloat(reviewData.overall_rating) || 1.0,
    comment: reviewData.comment || null
  };

  try {
    await pool.query(`
      INSERT INTO tournament_reviews (id, "tournamentId", "userId", overall_rating, comment, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      newReview.id, newReview.tournamentId, newReview.userId,
      newReview.overall_rating, newReview.comment, new Date(), new Date()
    ]);

    // Fetch the created review to get timestamps
    const result = await pool.query('SELECT * FROM tournament_reviews WHERE id = $1', [newReview.id]);
    if (result.rows.length > 0) {
      return formatTournamentReview(result.rows[0]);
    }

    // Fallback if fetch fails
    return {
      ...newReview,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error creating tournament review:', error);
    throw error;
  }
}

export async function getReviewsByTournamentId(tournamentId: string) {
  const pool = getPool();
  
  try {
    console.log('Fetching reviews for tournament:', tournamentId);
    const result = await pool.query('SELECT * FROM tournament_reviews WHERE "tournamentId" = $1 ORDER BY "createdAt" DESC', [tournamentId]);
    console.log('Tournament reviews query result:', { rowCount: result.rows.length });
    
    const formattedReviews = result.rows.map(formatTournamentReview);
    console.log('Formatted tournament reviews:', formattedReviews);
    
    return formattedReviews;
  } catch (error) {
    console.error('Error getting tournament reviews by id:', error);
    return [];
  }
}

export async function getAllTournamentReviews() {
  const pool = getPool();
  
  try {
    console.log('Executing getAllTournamentReviews query...');
    const result = await pool.query('SELECT * FROM tournament_reviews ORDER BY "createdAt" DESC');
    console.log('All tournament reviews query result:', { rowCount: result.rows.length });
    
    const formattedReviews = result.rows.map(formatTournamentReview);
    console.log('Formatted tournament reviews:', formattedReviews);
    
    return formattedReviews;
  } catch (error) {
    console.error('Error getting all tournament reviews:', error);
    return [];
  }
}

// Helper function to format tournament review data
function formatTournamentReview(row: any) {
  return {
    id: row.id,
    tournamentId: row.tournamentId,
    userId: row.userId,
    overall_rating: row.overall_rating,
    comment: row.comment,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    // Add user info if userId exists (will need to join with users table later)
    user: row.userId ? {
      id: row.userId,
      name: 'User', // TODO: Join with users table to get actual name
      email: 'user@example.com'
    } : null
  };
}