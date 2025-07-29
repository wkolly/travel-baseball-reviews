import { useQuery } from 'react-query';
import { teamsAPI } from '@/services/api';
import { TeamQuery } from '@travel-baseball/shared';

export const useTeams = (query: TeamQuery = {}) => {
  return useQuery(
    ['teams', query],
    () => teamsAPI.getTeams(query),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
};

export const useTeam = (id: string) => {
  return useQuery(
    ['team', id],
    () => teamsAPI.getTeam(id),
    {
      enabled: !!id,
    }
  );
};