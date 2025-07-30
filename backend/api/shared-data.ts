// Shared in-memory data store for demo purposes
export let teamsData = [
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
];

export let tournamentsData = [
  {
    id: '1',
    name: 'Summer Championship Series',
    location: 'Orlando, FL',
    startDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 32 * 86400000).toISOString(),
    ageGroups: '["12U", "14U", "16U"]',
    description: 'Premier summer tournament featuring top teams from across the Southeast',
    entryFee: 850,
    maxTeams: 32,
    status: 'active',
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    user: {
      id: 'user-1',
      name: 'Tournament Director',
      email: 'director@summerseries.com'
    },
    _count: { reviews: 1 }
  },
  {
    id: '2',
    name: 'Fall Classic Tournament',
    location: 'Phoenix, AZ',
    startDate: new Date(Date.now() + 60 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 62 * 86400000).toISOString(),
    ageGroups: '["10U", "12U", "14U"]',
    description: 'Annual fall tournament with excellent facilities',
    entryFee: 750,
    maxTeams: 24,
    status: 'active',
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    user: {
      id: 'user-2',
      name: 'Classic Organizer',
      email: 'organizer@fallclassic.com'
    },
    _count: { reviews: 2 }
  }
];

let nextTeamId = 4;

export function addTeam(teamData: any) {
  const newTeam = {
    id: String(nextTeamId++),
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
  
  teamsData.push(newTeam);
  return newTeam;
}