import React from 'react';
import { Link } from 'react-router-dom';
import { Team } from '@travel-baseball/shared';
import { MapPin, Star, Users, Calendar } from 'lucide-react';

interface TeamCardProps {
  team: Team & { avgRating?: number };
}

const TeamCard: React.FC<TeamCardProps> = ({ team }) => {
  const parseAgeGroups = (ageGroups: string): string[] => {
    try {
      return JSON.parse(ageGroups);
    } catch {
      return [];
    }
  };

  const ageGroups = parseAgeGroups(team.ageGroups);

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="card-body">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
            {team.name}
          </h3>
          {team.avgRating !== undefined && team.avgRating > 0 && (
            <div className="flex items-center ml-2">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              <span className="text-sm font-medium">{team.avgRating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm">{team.location}, {team.state}</span>
          </div>
          
          {ageGroups.length > 0 && (
            <div className="flex items-center text-gray-600">
              <Users className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-sm">{ageGroups.join(', ')}</span>
            </div>
          )}
          
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm">
              Created {new Date(team.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        {team.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {team.description}
          </p>
        )}
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {team._count?.reviews || 0} review{team._count?.reviews !== 1 ? 's' : ''}
          </div>
          <Link
            to={`/teams/${team.id}`}
            className="btn-primary btn-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;