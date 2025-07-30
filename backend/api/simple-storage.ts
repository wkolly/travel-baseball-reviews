// Simple JSON file storage for demonstration
// In production, you'd use a proper database like PostgreSQL, MySQL, or MongoDB

const STORAGE_KEY = 'travelball_data';

// Initial data
const initialData = {
  teams: [
    {
      id: '1',
      name: 'Atlanta Thunder',
      location: 'Atlanta',
      state: 'GA',
      ageGroups: '["12U", "14U"]',
      description: 'Competitive travel baseball team',
      status: 'approved',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      user: {
        id: 'user-1',
        name: 'Coach Thompson',
        email: 'coach@atlantathunder.com'
      },
      _count: { reviews: 3 }
    },
    {
      id: '2',
      name: 'Dallas Diamonds',
      location: 'Dallas',
      state: 'TX',
      ageGroups: '["10U", "12U"]',
      description: 'Premier youth baseball organization',
      status: 'approved',
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      user: {
        id: 'user-2', 
        name: 'Manager Davis',
        email: 'manager@dallasdiamonds.com'
      },
      _count: { reviews: 2 }
    },
    {
      id: '3',
      name: 'Houston Heat',
      location: 'Houston',
      state: 'TX',
      ageGroups: '["14U", "16U"]',
      description: 'Competitive baseball team focused on player development',
      status: 'pending',
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      user: {
        id: 'user-3',
        name: 'Director Martinez',
        email: 'director@houstonheat.com'
      },
      _count: { reviews: 0 }
    }
  ]
};

// Simple global variable storage (persists within function execution)
let dataStore: any = null;

function loadData() {
  if (!dataStore) {
    dataStore = { ...initialData };
  }
  return dataStore;
}

function saveData() {
  // In a real app, this would save to a database
  // For serverless demo, data persists only during function execution
  console.log('Data saved (in-memory):', dataStore);
}

export function getAllTeams() {
  const data = loadData();
  return data.teams;
}

export function getTeamById(id: string) {
  const data = loadData();
  return data.teams.find((team: any) => team.id === id) || null;
}

export function getPendingTeams() {
  const data = loadData();
  return data.teams.filter((team: any) => team.status === 'pending');
}

export function createTeam(teamData: any) {
  const data = loadData();
  
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
    user: {
      id: 'user-' + Date.now(),
      name: teamData.contact || 'Team Contact',
      email: teamData.email || 'contact@example.com'
    },
    _count: { reviews: 0 }
  };

  data.teams.push(newTeam);
  saveData();
  
  return newTeam;
}

export function updateTeam(id: string, updates: any) {
  const data = loadData();
  const teamIndex = data.teams.findIndex((team: any) => team.id === id);
  
  if (teamIndex === -1) return null;

  data.teams[teamIndex] = {
    ...data.teams[teamIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  saveData();
  return data.teams[teamIndex];
}

export function deleteTeam(id: string) {
  const data = loadData();
  const teamIndex = data.teams.findIndex((team: any) => team.id === id);
  
  if (teamIndex === -1) return null;

  const deletedTeam = data.teams.splice(teamIndex, 1)[0];
  saveData();
  
  return deletedTeam;
}

export function approveTeam(id: string) {
  return updateTeam(id, { status: 'approved' });
}

export function rejectTeam(id: string) {
  return deleteTeam(id);
}

export function getTeamStats() {
  const data = loadData();
  const teams = data.teams;
  
  return {
    total: teams.length,
    approved: teams.filter((t: any) => t.status === 'approved').length,
    pending: teams.filter((t: any) => t.status === 'pending').length
  };
}