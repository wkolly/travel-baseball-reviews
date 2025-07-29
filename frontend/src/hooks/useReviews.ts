import { useQuery, useMutation, useQueryClient } from 'react-query';
import { reviewsAPI } from '@/services/api';
import { CreateReviewRequest } from '@travel-baseball/shared';

export const useTeamReviews = (teamId: string) => {
  return useQuery(
    ['reviews', teamId],
    () => reviewsAPI.getTeamReviews(teamId),
    {
      enabled: !!teamId,
    }
  );
};

export const useCreateReview = (teamId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (reviewData: CreateReviewRequest) => reviewsAPI.createReview(teamId, reviewData),
    {
      onSuccess: () => {
        // Invalidate and refetch reviews for this team
        queryClient.invalidateQueries(['reviews', teamId]);
        // Also invalidate the team data to update review counts
        queryClient.invalidateQueries(['team', teamId]);
      },
    }
  );
};

export const useUpdateReview = (teamId: string, reviewId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (reviewData: CreateReviewRequest) => reviewsAPI.updateReview(teamId, reviewId, reviewData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reviews', teamId]);
        queryClient.invalidateQueries(['team', teamId]);
      },
    }
  );
};

export const useDeleteReview = (teamId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (reviewId: string) => reviewsAPI.deleteReview(reviewId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reviews', teamId]);
        queryClient.invalidateQueries(['team', teamId]);
      },
    }
  );
};