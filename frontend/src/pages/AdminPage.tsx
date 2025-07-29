import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/services/api';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, Users, BarChart } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface PendingTeam {
  id: string;
  name: string;
  location: string;
  state: string;
  ageGroups: string;
  description?: string;
  contact?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

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

  const { data: pendingTeamsData, isLoading: teamsLoading } = useQuery(
    'admin-pending-teams',
    () => adminAPI.getPendingTeams()
  );

  const approveTeamMutation = useMutation(
    (teamId: string) => adminAPI.approveTeam(teamId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-pending-teams');
        queryClient.invalidateQueries('admin-stats');
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

  const stats = statsData?.data;
  const pendingTeams: PendingTeam[] = pendingTeamsData?.data?.teams || [];

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
        <p className="text-lg text-gray-600">
          Manage team suggestions and site content.
        </p>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

      {/* Pending Teams */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Pending Team Suggestions</h2>
        </div>
        
        {teamsLoading ? (
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
                      <p><strong>Contact:</strong> {team.contact || 'Not provided'}</p>
                      <p><strong>Suggested by:</strong> {team.user.name} ({team.user.email})</p>
                      <p><strong>Submitted:</strong> {new Date(team.createdAt).toLocaleDateString()}</p>
                    </div>
                    {team.description && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Description:</p>
                        <p className="text-sm text-gray-600">{team.description}</p>
                      </div>
                    )}
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
    </div>
  );
};

export default AdminPage;