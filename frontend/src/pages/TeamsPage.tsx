import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeams } from '@/hooks/useTeams';
import { useDebounce } from '@/hooks/useDebounce';
import TeamCard from '@/components/TeamCard';
import TeamFilters from '@/components/TeamFilters';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Team } from '@travel-baseball/shared';

const TeamsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [filters, setFilters] = useState({
    search: '',
    state: '',
    ageGroup: '',
    minRating: '',
  });

  // Debounce search input to avoid too many API calls (500ms delay)
  const debouncedSearch = useDebounce(filters.search, 500);
  
  // Build query parameters with debounced search
  const query = useMemo(() => {
    const params: any = {};
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (filters.state) params.state = filters.state;
    if (filters.ageGroup) params.ageGroup = filters.ageGroup;
    if (filters.minRating) params.minRating = parseFloat(filters.minRating);
    return params;
  }, [debouncedSearch, filters.state, filters.ageGroup, filters.minRating]);

  const { data, isLoading, error } = useTeams(query);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      state: '',
      ageGroup: '',
      minRating: '',
    });
  };

  const teams = data?.data?.teams || [];
  const pagination = data?.data?.pagination;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Find Travel Baseball Teams
          </h1>
          <p className="text-lg text-gray-600">
            Search and discover travel baseball teams in your area.
          </p>
        </div>
        
        {isAuthenticated && (
          <Link
            to="/teams/create"
            className="btn-primary inline-flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Your Team
          </Link>
        )}
      </div>

      {/* Filters */}
      <TeamFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        isSearching={isLoading && filters.search !== debouncedSearch}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Error State */}
      {error as any && (
        <div className="card mb-8">
          <div className="card-body">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Unable to load teams
                </h3>
                <p className="text-gray-600 mb-4">
                  There was an error loading the teams. Please try again.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn-primary"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {!isLoading && !error && (
        <>
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-600">
              {pagination ? (
                <>
                  Showing {teams.length} of {pagination.total} teams
                  {Object.values(filters).some(v => v) && ' (filtered)'}
                </>
              ) : (
                `${teams.length} team${teams.length !== 1 ? 's' : ''} found`
              )}
            </div>
          </div>

          {/* Teams Grid */}
          {teams.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team: Team & { avgRating?: number }) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          ) : (
            <div className="card">
              <div className="card-body">
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20.5a7.962 7.962 0 01-5.657-2.209l0 0A7.962 7.962 0 014.5 12A7.962 7.962 0 0112 4.5a7.962 7.962 0 015.657 2.209A7.962 7.962 0 0120.5 12a7.962 7.962 0 01-2.209 5.657l0 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No teams found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {Object.values(filters).some(v => v) 
                      ? 'Try adjusting your search filters or clearing them to see more teams.'
                      : 'Be the first to add a team to the platform!'}
                  </p>
                  {Object.values(filters).some(v => v) ? (
                    <button
                      onClick={handleClearFilters}
                      className="btn-secondary"
                    >
                      Clear Filters
                    </button>
                  ) : isAuthenticated ? (
                    <Link to="/teams/create" className="btn-primary">
                      <Plus className="h-5 w-5 mr-2" />
                      Add First Team
                    </Link>
                  ) : (
                    <Link to="/register" className="btn-primary">
                      Sign Up to Add Teams
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TeamsPage;