import Database from 'better-sqlite3';
import { join } from 'path';

// Use /tmp directory for serverless compatibility
const dbPath = '/tmp/travelball.db';

let db: Database.Database | null = null;

export function getDatabase() {
  if (!db) {
    db = new Database(dbPath);
    initializeDatabase();
  }
  return db;
}

function initializeDatabase() {
  if (!db) return;

  // Create teams table
  db.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT,
      state TEXT,
      ageGroups TEXT,
      description TEXT,
      status TEXT DEFAULT 'pending',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      userId TEXT,
      userName TEXT,
      userEmail TEXT,
      reviewCount INTEGER DEFAULT 0
    )
  `);

  // Create tournaments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT,
      startDate TEXT,
      endDate TEXT,
      ageGroups TEXT,
      description TEXT,
      entryFee INTEGER,
      maxTeams INTEGER,
      status TEXT DEFAULT 'active',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      userId TEXT,
      userName TEXT,
      userEmail TEXT,
      reviewCount INTEGER DEFAULT 0
    )
  `);

  // Insert default data if tables are empty
  const teamCount = db.prepare('SELECT COUNT(*) as count FROM teams').get() as { count: number };
  
  if (teamCount.count === 0) {
    const insertTeam = db.prepare(`
      INSERT INTO teams (id, name, location, state, ageGroups, description, status, createdAt, updatedAt, userId, userName, userEmail, reviewCount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Insert default teams
    insertTeam.run(
      '1', 'Atlanta Thunder', 'Atlanta', 'GA', '["12U", "14U"]',
      'Competitive travel baseball team', 'approved',
      new Date(Date.now() - 30 * 86400000).toISOString(),
      new Date(Date.now() - 7 * 86400000).toISOString(),
      'user-1', 'Coach Thompson', 'coach@atlantathunder.com', 3
    );

    insertTeam.run(
      '2', 'Dallas Diamonds', 'Dallas', 'TX', '["10U", "12U"]',
      'Premier youth baseball organization', 'approved',
      new Date(Date.now() - 20 * 86400000).toISOString(),
      new Date(Date.now() - 5 * 86400000).toISOString(),
      'user-2', 'Manager Davis', 'manager@dallasdiamonds.com', 2
    );

    insertTeam.run(
      '3', 'Houston Heat', 'Houston', 'TX', '["14U", "16U"]',
      'Competitive baseball team focused on player development', 'pending',
      new Date(Date.now() - 15 * 86400000).toISOString(),
      new Date(Date.now() - 2 * 86400000).toISOString(),
      'user-3', 'Director Martinez', 'director@houstonheat.com', 0
    );
  }

  const tournamentCount = db.prepare('SELECT COUNT(*) as count FROM tournaments').get() as { count: number };
  
  if (tournamentCount.count === 0) {
    const insertTournament = db.prepare(`
      INSERT INTO tournaments (id, name, location, startDate, endDate, ageGroups, description, entryFee, maxTeams, status, createdAt, updatedAt, userId, userName, userEmail, reviewCount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertTournament.run(
      '1', 'Summer Championship Series', 'Orlando, FL',
      new Date(Date.now() + 30 * 86400000).toISOString(),
      new Date(Date.now() + 32 * 86400000).toISOString(),
      '["12U", "14U", "16U"]',
      'Premier summer tournament featuring top teams from across the Southeast',
      850, 32, 'active',
      new Date(Date.now() - 60 * 86400000).toISOString(),
      new Date(Date.now() - 10 * 86400000).toISOString(),
      'user-1', 'Tournament Director', 'director@summerseries.com', 1
    );

    insertTournament.run(
      '2', 'Fall Classic Tournament', 'Phoenix, AZ',
      new Date(Date.now() + 60 * 86400000).toISOString(),
      new Date(Date.now() + 62 * 86400000).toISOString(),
      '["10U", "12U", "14U"]',
      'Annual fall tournament with excellent facilities',
      750, 24, 'active',
      new Date(Date.now() - 45 * 86400000).toISOString(),
      new Date(Date.now() - 5 * 86400000).toISOString(),
      'user-2', 'Classic Organizer', 'organizer@fallclassic.com', 2
    );
  }
}

// Team operations
export function getAllTeams() {
  const db = getDatabase();
  const teams = db.prepare('SELECT * FROM teams ORDER BY createdAt DESC').all();
  
  return teams.map(team => ({
    ...team,
    user: {
      id: team.userId,
      name: team.userName,
      email: team.userEmail
    },
    _count: { reviews: team.reviewCount }
  }));
}

export function getTeamById(id: string) {
  const db = getDatabase();
  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(id);
  
  if (!team) return null;
  
  return {
    ...team,
    user: {
      id: team.userId,
      name: team.userName,
      email: team.userEmail
    },
    _count: { reviews: team.reviewCount }
  };
}

export function getPendingTeams() {
  const db = getDatabase();
  const teams = db.prepare('SELECT * FROM teams WHERE status = ? ORDER BY createdAt DESC').all('pending');
  
  return teams.map(team => ({
    ...team,
    user: {
      id: team.userId,
      name: team.userName,
      email: team.userEmail
    },
    _count: { reviews: team.reviewCount }
  }));
}

export function createTeam(teamData: any) {
  const db = getDatabase();
  
  const newTeam = {
    id: String(Date.now()),
    name: teamData.name || 'New Team',
    location: teamData.location || '',
    state: teamData.state || '',
    ageGroups: teamData.ageGroups || '[]',
    description: teamData.description || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 'user-' + Date.now(),
    userName: teamData.contact || 'Team Contact',
    userEmail: teamData.email || 'contact@example.com',
    reviewCount: 0
  };

  const insert = db.prepare(`
    INSERT INTO teams (id, name, location, state, ageGroups, description, status, createdAt, updatedAt, userId, userName, userEmail, reviewCount)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run(
    newTeam.id, newTeam.name, newTeam.location, newTeam.state, newTeam.ageGroups,
    newTeam.description, newTeam.status, newTeam.createdAt, newTeam.updatedAt,
    newTeam.userId, newTeam.userName, newTeam.userEmail, newTeam.reviewCount
  );

  return {
    ...newTeam,
    user: {
      id: newTeam.userId,
      name: newTeam.userName,
      email: newTeam.userEmail
    },
    _count: { reviews: newTeam.reviewCount }
  };
}

export function updateTeam(id: string, updates: any) {
  const db = getDatabase();
  
  const team = getTeamById(id);
  if (!team) return null;

  const updatedTeam = {
    ...team,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  const update = db.prepare(`
    UPDATE teams 
    SET name = ?, location = ?, state = ?, ageGroups = ?, description = ?, status = ?, updatedAt = ?
    WHERE id = ?
  `);

  update.run(
    updatedTeam.name, updatedTeam.location, updatedTeam.state, updatedTeam.ageGroups,
    updatedTeam.description, updatedTeam.status, updatedTeam.updatedAt, id
  );

  return getTeamById(id);
}

export function deleteTeam(id: string) {
  const db = getDatabase();
  
  const team = getTeamById(id);
  if (!team) return null;

  const deleteStmt = db.prepare('DELETE FROM teams WHERE id = ?');
  deleteStmt.run(id);

  return team;
}

export function approveTeam(id: string) {
  return updateTeam(id, { status: 'approved' });
}

export function rejectTeam(id: string) {
  return deleteTeam(id);
}

// Tournament operations
export function getAllTournaments() {
  const db = getDatabase();
  const tournaments = db.prepare('SELECT * FROM tournaments ORDER BY createdAt DESC').all();
  
  return tournaments.map(tournament => ({
    ...tournament,
    user: {
      id: tournament.userId,
      name: tournament.userName,
      email: tournament.userEmail
    },
    _count: { reviews: tournament.reviewCount }
  }));
}

export function getTeamStats() {
  const db = getDatabase();
  
  const totalTeams = db.prepare('SELECT COUNT(*) as count FROM teams').get() as { count: number };
  const approvedTeams = db.prepare('SELECT COUNT(*) as count FROM teams WHERE status = ?').get('approved') as { count: number };
  const pendingTeams = db.prepare('SELECT COUNT(*) as count FROM teams WHERE status = ?').get('pending') as { count: number };

  return {
    total: totalTeams.count,
    approved: approvedTeams.count,
    pending: pendingTeams.count
  };
}