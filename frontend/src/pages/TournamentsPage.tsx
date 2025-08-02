import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { MapPin, Trophy, Search, Star, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { tournamentsAPI } from '@/services/api';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Tournament {
  id: string;
  name: string;
  location: string;
  description?: string;
  _count: { reviews: number };
  avgRating: number;
}

const TournamentCard: React.FC<{ tournament: Tournament }> = ({ tournament }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasLongDescription = tournament.description && tournament.description.length > 80;
  const shortDescription = tournament.description ? tournament.description.substring(0, 80) : '';

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="p-3 sm:p-4">
        {/* Compact Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 leading-tight">
              <Link 
                to={`/tournaments/${tournament.id}`}
                className="hover:text-blue-600 transition-colors"
              >
                {tournament.name}
              </Link>
            </h3>
            <div className="flex items-center text-gray-600 text-sm mt-1">
              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{tournament.location}</span>
            </div>
          </div>
          
          {/* Compact Rating */}
          <div className="flex items-center ml-2 flex-shrink-0">
            <Star className={`h-3 w-3 ${tournament.avgRating >= 1 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
            <span className="text-xs text-gray-600 ml-1">
              {tournament.avgRating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Expandable Description */}
        {tournament.description && (
          <div className="mb-2">
            <p className="text-gray-600 text-xs leading-relaxed">
              {isExpanded ? tournament.description : shortDescription}
              {hasLongDescription && !isExpanded && '...'}
            </p>
            {hasLongDescription && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-600 text-xs hover:text-blue-700 transition-colors flex items-center mt-1"
              >
                {isExpanded ? (
                  <>
                    Show less <ChevronUp className="h-3 w-3 ml-1" />
                  </>
                ) : (
                  <>
                    Show more <ChevronDown className="h-3 w-3 ml-1" />
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Compact Footer */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {tournament._count.reviews} reviews
          </div>
          <Link
            to={`/tournaments/${tournament.id}`}
            className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
};

const TournamentsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Debounce search inputs to avoid too many API calls
  const debouncedSearch = useDebounce(searchTerm, 500);
  const debouncedLocation = useDebounce(selectedLocation, 500);

  // Build query parameters
  const query = useMemo(() => {
    const params: any = {};
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (debouncedLocation.trim()) params.location = debouncedLocation.trim();
    return params;
  }, [debouncedSearch, debouncedLocation]);

  const { data: tournamentsData, isLoading, error } = useQuery(
    ['tournaments', query],
    () => tournamentsAPI.getTournaments(query),
    {
      keepPreviousData: true,
      staleTime: 30000,
    }
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading tournaments</div>;

  const tournaments: Tournament[] = tournamentsData?.data?.tournaments || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Tournament Directory</h1>
          <p className="text-lg text-gray-600">
            Find tournaments and read reviews from other families about their experiences.
          </p>
        </div>
        
        {isAuthenticated ? (
          <Link
            to="/tournaments/create"
            className="btn-primary inline-flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Tournament
          </Link>
        ) : (
          <div className="text-right">
            <Link
              to="/login"
              className="btn-primary inline-flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Login to Add Tournament
            </Link>
            <p className="text-sm text-gray-500 mt-1">
              Create an account to list tournaments
            </p>
          </div>
        )}
      </div>

      {/* Login Call-to-Action for non-authenticated users */}
      {!isAuthenticated && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-1">
                Host tournaments?
              </h3>
              <p className="text-blue-700 text-sm sm:text-base">
                <span className="sm:hidden">Help families find your events.</span>
                <span className="hidden sm:inline">List your tournaments and help families find great baseball events in their area.</span>
              </p>
            </div>
            <div className="flex gap-2 sm:ml-4 sm:flex-shrink-0">
              <Link
                to="/register"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm whitespace-nowrap w-full sm:w-auto text-center"
              >
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search tournaments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                isLoading && searchTerm !== debouncedSearch ? 'bg-gray-50' : ''
              }`}
            />
            {isLoading && searchTerm !== debouncedSearch && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Location (city, state)"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                isLoading && selectedLocation !== debouncedLocation ? 'bg-gray-50' : ''
              }`}
            />
            {isLoading && selectedLocation !== debouncedLocation && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {tournaments.length} tournament{tournaments.length !== 1 ? 's' : ''}
          {(debouncedSearch || debouncedLocation) && ' (filtered)'}
        </p>
      </div>

      {/* Tournament Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((tournament) => (
          <TournamentCard key={tournament.id} tournament={tournament} />
        ))}
      </div>

      {tournaments.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tournaments found</h3>
          <p className="text-gray-600 mb-4">
            {(debouncedSearch || debouncedLocation) 
              ? 'Try adjusting your search criteria to find more tournaments.'
              : 'Be the first to add a tournament to the platform!'}
          </p>
          {(debouncedSearch || debouncedLocation) ? (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedLocation('');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          ) : isAuthenticated ? (
            <Link to="/tournaments/create" className="btn-primary">
              <Plus className="h-5 w-5 mr-2" />
              Add First Tournament
            </Link>
          ) : (
            <Link to="/register" className="btn-primary">
              Sign Up to Add Tournaments
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default TournamentsPage;