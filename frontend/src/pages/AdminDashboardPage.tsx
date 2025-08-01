import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/services/api';
import toast from 'react-hot-toast';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  BarChart, 
  Trophy,
  Edit,
  Trash2,
  UserCheck,
  Star,
  MessageSquare
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  _count: {
    teams: number;
    tournaments: number;
    reviews: number;
  };
}

interface Team {
  id: string;
  name: string;
  location: string;
  state: string;
  ageGroups: string;
  description?: string;
  contact?: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  suggester?: {
    id: string;
    name: string;
    email: string;
  };
  approver?: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    reviews: number;
  };
}

interface Tournament {
  id: string;
  name: string;
  location: string;
  description?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    reviews: number;
  };
}

interface AdminReview {
  id: string;
  comment?: string;
  overall_rating?: number;
  coaching_rating?: number;
  organization_rating?: number;
  facilities_rating?: number;
  value_rating?: number;
  createdAt: string;
  type: 'team' | 'tournament';
  entityName: string;
  entityId: string;
}

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [teamEditForm, setTeamEditForm] = useState({
    name: '',
    location: '',
    state: '',
    ageGroups: [] as string[],
    description: '',
    contact: ''
  });
  const [tournamentEditForm, setTournamentEditForm] = useState({
    name: '',
    location: '',
    description: ''
  });

  // Redirect if not admin
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const { data: statsData, isLoading: statsLoading } = useQuery(
    'admin-stats',
    adminAPI.getStats
  );

  const { data: usersData, isLoading: usersLoading } = useQuery(
    'admin-users',
    () => adminAPI.getUsers(),
    { enabled: activeTab === 'users' }
  );

  const { data: teamsData, isLoading: teamsLoading } = useQuery(
    'admin-teams',
    () => adminAPI.getAllTeams(),
    { enabled: activeTab === 'teams' }
  );

  const { data: tournamentsData, isLoading: tournamentsLoading } = useQuery(
    'admin-tournaments',
    () => adminAPI.getAllTournaments(),
    { enabled: activeTab === 'tournaments' }
  );

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery(
    'admin-reviews',
    () => adminAPI.getAllReviews(),
    { enabled: activeTab === 'reviews' }
  );

  const { data: pendingTeamsData, isLoading: pendingTeamsLoading } = useQuery(
    'admin-pending-teams',
    () => adminAPI.getPendingTeams(),
    { enabled: activeTab === 'pending' }
  );

  const approveTeamMutation = useMutation(
    (teamId: string) => adminAPI.approveTeam(teamId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-pending-teams');
        queryClient.invalidateQueries('admin-stats');
        queryClient.invalidateQueries('admin-teams');
        queryClient.invalidateQueries('teams');
        toast.success('Team approved successfully!');
      },
      onError: () => {
        toast.error('Error approving team');
      },
    }
  );

  const rejectTeamMutation = useMutation(
    ({ teamId, reason }: { teamId: string; reason?: string }) => 
      adminAPI.rejectTeam(teamId, reason),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-pending-teams');
        queryClient.invalidateQueries('admin-stats');
        toast.success('Team rejected successfully');
      },
      onError: () => {
        toast.error('Error rejecting team');
      },
    }
  );

  const deleteTeamMutation = useMutation(
    (teamId: string) => adminAPI.deleteTeam(teamId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-teams');
        queryClient.invalidateQueries('admin-stats');
        queryClient.invalidateQueries('teams');
        toast.success('Team deleted successfully');
      },
      onError: () => {
        toast.error('Error deleting team');
      },
    }
  );

  const updateTeamMutation = useMutation(
    ({ teamId, data }: { teamId: string; data: any }) => adminAPI.updateTeam(teamId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-teams');
        queryClient.invalidateQueries('teams');
        setEditingTeam(null);
        toast.success('Team updated successfully');
      },
      onError: () => {
        toast.error('Error updating team');
      },
    }
  );

  const updateTournamentMutation = useMutation(
    ({ tournamentId, data }: { tournamentId: string; data: any }) => adminAPI.updateTournament(tournamentId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-tournaments');
        queryClient.invalidateQueries('tournaments');
        setEditingTournament(null);
        toast.success('Tournament updated successfully');
      },
      onError: () => {
        toast.error('Error updating tournament');
      },
    }
  );

  const deleteTournamentMutation = useMutation(
    (tournamentId: string) => adminAPI.deleteTournament(tournamentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-tournaments');
        queryClient.invalidateQueries('tournaments');
        toast.success('Tournament deleted successfully');
      },
      onError: () => {
        toast.error('Error deleting tournament');
      },
    }
  );

  const deleteTeamReviewMutation = useMutation(
    (reviewId: string) => adminAPI.deleteTeamReview(reviewId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-reviews');
        queryClient.invalidateQueries('admin-stats');
        toast.success('Team review deleted successfully');
      },
      onError: () => {
        toast.error('Error deleting review');
      },
    }
  );

  const deleteTournamentReviewMutation = useMutation(
    (reviewId: string) => adminAPI.deleteTournamentReview(reviewId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-reviews');
        queryClient.invalidateQueries('admin-stats');
        toast.success('Tournament review deleted successfully');
      },
      onError: () => {
        toast.error('Error deleting review');
      },
    }
  );

  const stats = statsData?.data;
  const users: User[] = usersData?.data?.users || [];
  const teams: Team[] = teamsData?.data?.teams || [];
  const tournaments: Tournament[] = tournamentsData?.data?.tournaments || [];
  const pendingTeams: Team[] = pendingTeamsData?.data?.teams || [];
  const reviews: AdminReview[] = reviewsData?.data?.reviews || [];

  const handleApprove = (teamId: string) => {
    if (window.confirm('Are you sure you want to approve this team?')) {
      approveTeamMutation.mutate(teamId);
    }
  };

  const handleReject = (teamId: string) => {
    const reason = window.prompt('Reason for rejection (optional):');
    if (window.confirm('Are you sure you want to reject this team?')) {
      rejectTeamMutation.mutate({ teamId, reason: reason || undefined });
    }
  };

  const handleDeleteTeam = (teamId: string) => {
    if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      deleteTeamMutation.mutate(teamId);
    }
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    
    // Safely parse ageGroups with fallback
    let parsedAgeGroups: string[] = [];
    try {
      if (team.ageGroups) {
        const parsed = JSON.parse(team.ageGroups);
        parsedAgeGroups = Array.isArray(parsed) ? parsed : [parsed];
      }
    } catch (error) {
      console.warn('Failed to parse ageGroups for team', team.id, ':', error);
      parsedAgeGroups = [];
    }
    
    setTeamEditForm({
      name: team.name,
      location: team.location,
      state: team.state,
      ageGroups: parsedAgeGroups,
      description: team.description || '',
      contact: team.contact || ''
    });
  };

  const handleUpdateTeam = () => {
    if (!editingTeam) return;
    
    // Validate that at least one age group is selected
    if (teamEditForm.ageGroups.length === 0) {
      toast.error('Please select at least one age group');
      return;
    }
    
    // Format the data for the backend - convert ageGroups array to JSON string
    const formattedData = {
      ...teamEditForm,
      ageGroups: JSON.stringify(teamEditForm.ageGroups)
    };
    
    updateTeamMutation.mutate({
      teamId: editingTeam.id,
      data: formattedData
    });
  };

  const handleEditTournament = (tournament: Tournament) => {
    setEditingTournament(tournament);
    setTournamentEditForm({
      name: tournament.name,
      location: tournament.location,
      description: tournament.description || ''
    });
  };

  const handleUpdateTournament = () => {
    if (!editingTournament) return;
    updateTournamentMutation.mutate({
      tournamentId: editingTournament.id,
      data: tournamentEditForm
    });
  };

  const handleDeleteTournament = (tournamentId: string) => {
    if (window.confirm('Are you sure you want to delete this tournament? This action cannot be undone.')) {
      deleteTournamentMutation.mutate(tournamentId);
    }
  };

  const handleDeleteReview = (review: AdminReview) => {
    if (window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      if (review.type === 'team') {
        deleteTeamReviewMutation.mutate(review.id);
      } else {
        deleteTournamentReviewMutation.mutate(review.id);
      }
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart },
    { id: 'pending', name: 'Pending Teams', icon: Clock },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'teams', name: 'Teams', icon: UserCheck },
    { id: 'tournaments', name: 'Tournaments', icon: Trophy },
    { id: 'reviews', name: 'Reviews', icon: MessageSquare },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
        <p className="text-lg text-gray-600">
          Manage users, teams, tournaments, and site content.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Cards */}
          {statsLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending Teams</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.teams?.pending || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Approved Teams</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.teams?.approved || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Teams</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.teams?.total || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <BarChart className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Reviews</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.reviews?.total || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Pending Team Suggestions</h2>
          </div>
          
          {pendingTeamsLoading ? (
            <div className="p-6">
              <LoadingSpinner />
            </div>
          ) : pendingTeams.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No pending team suggestions.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {pendingTeams.map((team) => (
                <div key={team.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {team.name}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600 mb-4">
                        <p><strong>Location:</strong> {team.location}, {team.state}</p>
                        <p><strong>Age Groups:</strong> {JSON.parse(team.ageGroups).join(', ')}</p>
                        <p><strong>Suggested by:</strong> {team.user.name} ({team.user.email})</p>
                        <p><strong>Submitted:</strong> {new Date(team.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="ml-6 flex space-x-3">
                      <button
                        onClick={() => handleApprove(team.id)}
                        disabled={approveTeamMutation.isLoading}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </button>
                      
                      <button
                        onClick={() => handleReject(team.id)}
                        disabled={rejectTeamMutation.isLoading}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Users</h2>
          </div>
          
          {usersLoading ? (
            <div className="p-6">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'ADMIN' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user._count.teams} teams, {user._count.tournaments} tournaments, {user._count.reviews} reviews
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'teams' && (
        <div className="bg-white rounded-lg shadow">          
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Teams</h2>
          </div>
          
          {teamsLoading ? (
            <div className="p-6">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reviews
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teams.map((team) => (
                    <tr key={team.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{team.name}</div>
                          <div className="text-sm text-gray-500">{team.location}, {team.state}</div>
                          <div className="text-xs text-gray-400">
                            Ages: {JSON.parse(team.ageGroups).join(', ')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          team.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : team.status === 'rejected' 
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {team.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div>{team.user.name}</div>
                          <div className="text-xs text-gray-400">{team.user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {team._count.reviews}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEditTeam(team)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTeam(team.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'tournaments' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Tournaments</h2>
          </div>
          
          {tournamentsLoading ? (
            <div className="p-6">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tournament
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reviews
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tournaments.map((tournament) => (
                    <tr key={tournament.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{tournament.name}</div>
                          <div className="text-sm text-gray-500">{tournament.location}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div>{tournament.user.name}</div>
                          <div className="text-xs text-gray-400">{tournament.user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tournament._count.reviews}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(tournament.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEditTournament(tournament)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTournament(tournament.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Reviews</h2>
          </div>
          
          {reviewsLoading ? (
            <div className="p-6">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Review
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reviews.map((review) => (
                    <tr key={review.id}>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          {review.comment ? (
                            <p className="text-sm text-gray-900 truncate">{review.comment}</p>
                          ) : (
                            <span className="text-sm text-gray-400 italic">No comment</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          review.type === 'team' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {review.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {review.entityName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {review.overall_rating && (
                            <>
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.overall_rating!
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className="ml-2 text-sm text-gray-600">
                                {review.overall_rating}/5
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteReview(review)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {reviews.length === 0 && !reviewsLoading && (
            <div className="p-6 text-center text-gray-500">
              No reviews found.
            </div>
          )}
        </div>
      )}

      {/* Team Edit Modal */}
      {editingTeam && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Team</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={teamEditForm.name}
                    onChange={(e) => setTeamEditForm({...teamEditForm, name: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    value={teamEditForm.location}
                    onChange={(e) => setTeamEditForm({...teamEditForm, location: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <select
                    value={teamEditForm.state}
                    onChange={(e) => setTeamEditForm({...teamEditForm, state: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a state</option>
                    {['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'].map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age Groups</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {['8U', '9U', '10U', '11U', '12U', '13U', '14U', '15U', '16U', '17U', '18U'].map((age) => (
                      <label key={age} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={teamEditForm.ageGroups.includes(age)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTeamEditForm({
                                ...teamEditForm,
                                ageGroups: [...teamEditForm.ageGroups, age]
                              });
                            } else {
                              setTeamEditForm({
                                ...teamEditForm,
                                ageGroups: teamEditForm.ageGroups.filter(g => g !== age)
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">{age}</span>
                      </label>
                    ))}
                  </div>
                  {teamEditForm.ageGroups.length === 0 && (
                    <p className="text-sm text-red-600 mt-1">Please select at least one age group.</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={teamEditForm.description}
                    onChange={(e) => setTeamEditForm({...teamEditForm, description: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact</label>
                  <input
                    type="text"
                    value={teamEditForm.contact}
                    onChange={(e) => setTeamEditForm({...teamEditForm, contact: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditingTeam(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateTeam}
                  disabled={updateTeamMutation.isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {updateTeamMutation.isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tournament Edit Modal */}
      {editingTournament && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Tournament</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={tournamentEditForm.name}
                    onChange={(e) => setTournamentEditForm({...tournamentEditForm, name: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    value={tournamentEditForm.location}
                    onChange={(e) => setTournamentEditForm({...tournamentEditForm, location: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={tournamentEditForm.description}
                    onChange={(e) => setTournamentEditForm({...tournamentEditForm, description: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditingTournament(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateTournament}
                  disabled={updateTournamentMutation.isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {updateTournamentMutation.isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;