import React from 'react';
import { Search, MapPin, Users, Star } from 'lucide-react';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const AGE_GROUPS = [
  '8U', '9U', '10U', '11U', '12U', '13U', '14U', '15U', '16U', '17U', '18U'
];

interface TeamFiltersProps {
  filters: {
    search: string;
    state: string;
    ageGroup: string;
    minRating: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  isSearching?: boolean;
}

const TeamFilters: React.FC<TeamFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  isSearching = false,
}) => {
  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="card mb-6">
      <div className="card-body">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Find Teams
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="form-label">
              <Search className="h-4 w-4 inline mr-1" />
              Search Teams
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Team name or location..."
                className={`form-input transition-all ${isSearching ? 'bg-gray-50' : ''}`}
                value={filters.search}
                onChange={(e) => onFilterChange('search', e.target.value)}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
          </div>

          {/* State */}
          <div>
            <label className="form-label">
              <MapPin className="h-4 w-4 inline mr-1" />
              State
            </label>
            <select
              className="form-select"
              value={filters.state}
              onChange={(e) => onFilterChange('state', e.target.value)}
            >
              <option value="">All States</option>
              {US_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* Age Group */}
          <div>
            <label className="form-label">
              <Users className="h-4 w-4 inline mr-1" />
              Age Group
            </label>
            <select
              className="form-select"
              value={filters.ageGroup}
              onChange={(e) => onFilterChange('ageGroup', e.target.value)}
            >
              <option value="">All Ages</option>
              {AGE_GROUPS.map((age) => (
                <option key={age} value={age}>
                  {age}
                </option>
              ))}
            </select>
          </div>

          {/* Minimum Rating */}
          <div>
            <label className="form-label">
              <Star className="h-4 w-4 inline mr-1" />
              Min Rating
            </label>
            <select
              className="form-select"
              value={filters.minRating}
              onChange={(e) => onFilterChange('minRating', e.target.value)}
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
              <option value="3.0">3.0+ Stars</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={onClearFilters}
              className="btn-secondary btn-sm"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamFilters;