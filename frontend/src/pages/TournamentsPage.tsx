import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { MapPin, Trophy, Search, Star } from 'lucide-react';
import { tournamentsAPI } from '@/services/api';
import { useDebounce } from '@/hooks/useDebounce';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Tournament {
  id: string;
  name: string;
  location: string;
  description?: string;
  _count: { reviews: number };
  avgRating: number;
}

const TournamentsPage: React.FC = () => {
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Tournament Directory</h1>
        <p className="text-lg text-gray-600">
          Find tournaments and read reviews from other families about their experiences.
        </p>
      </div>

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
      <div className="grid gap-6">
        {tournaments.map((tournament) => (
          <div key={tournament.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    <Link 
                      to={`/tournaments/${tournament.id}`}
                      className="hover:text-blue-600 transition-colors block truncate"
                    >
                      {tournament.name}
                    </Link>
                  </h3>
                  
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span className="text-lg truncate">{tournament.location}</span>
                  </div>

                  {tournament.description && (
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {tournament.description.length > 200 
                        ? `${tournament.description.substring(0, 200)}...` 
                        : tournament.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.floor(tournament.avgRating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600 whitespace-nowrap">
                        {tournament.avgRating.toFixed(1)} ({tournament._count.reviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0 lg:ml-6">
                  <Link
                    to={`/tournaments/${tournament.id}`}
                    className="block w-full lg:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center whitespace-nowrap"
                  >
                    View Reviews
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {tournaments.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tournaments found</h3>
          <p className="text-gray-600">
            {(debouncedSearch || debouncedLocation) 
              ? 'Try adjusting your search criteria to find more tournaments.'
              : 'Check back later for new tournaments.'}
          </p>
          {(debouncedSearch || debouncedLocation) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedLocation('');
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TournamentsPage;