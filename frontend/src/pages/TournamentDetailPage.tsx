import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { MapPin, Star, ArrowLeft, Plus } from 'lucide-react';
import { tournamentsAPI, tournamentReviewsAPI } from '@/services/api';
import { CreateTournamentReviewRequest } from '@travel-baseball/shared';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

interface TournamentReview {
  id: string;
  overall_rating: number;
  comment?: string;
  createdAt: string;
}

const TournamentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState<CreateTournamentReviewRequest>({
    overall_rating: 5,
    comment: ''
  });

  const { data: tournamentData, isLoading: tournamentLoading } = useQuery(
    ['tournament', id],
    () => tournamentsAPI.getTournament(id!),
    { enabled: !!id }
  );

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery(
    ['tournament-reviews', id],
    () => tournamentReviewsAPI.getTournamentReviews(id!),
    { enabled: !!id }
  );

  const createReviewMutation = useMutation(
    (data: CreateTournamentReviewRequest) => tournamentReviewsAPI.createTournamentReview(id!, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tournament-reviews', id]);
        queryClient.invalidateQueries(['tournament', id]);
        queryClient.invalidateQueries(['tournaments']);
        toast.success('Review submitted successfully!');
        setShowReviewForm(false);
        setReviewForm({ overall_rating: 5, comment: '' });
      },
      onError: (error: any) => {
        toast.error('Error submitting review. Please try again.');
        console.error('Error creating review:', error);
      },
    }
  );

  if (tournamentLoading) return <LoadingSpinner />;
  if (!tournamentData?.data) return <div>Tournament not found</div>;

  const tournament = tournamentData.data;
  const reviews: TournamentReview[] = reviewsData?.data?.reviews || [];
  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length : 0;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createReviewMutation.mutateAsync(reviewForm);
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Back Button */}
      <div className="mb-4 sm:mb-6">
        <Link
          to="/tournaments"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tournaments
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-8 mb-6 sm:mb-8">
        {/* Mobile-first stacked layout */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 leading-tight">{tournament.name}</h1>
            
            <div className="flex items-center text-gray-600 mt-2 sm:mt-4">
              <MapPin className="h-4 w-4 sm:h-6 sm:w-6 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="text-base sm:text-xl">{tournament.location}</span>
            </div>
          </div>

          {tournament.description && (
            <div className="pt-2">
              <div className="prose prose-sm sm:prose max-w-none">
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed break-words">
                  {tournament.description}
                </p>
              </div>
            </div>
          )}

          {/* Rating section - mobile responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
            <div className="flex flex-col xs:flex-row xs:items-center gap-2 sm:gap-6">
              <div className="flex items-center">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 sm:h-6 sm:w-6 ${
                        i < Math.floor(avgRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 sm:ml-3 text-sm sm:text-lg text-gray-600">
                  {avgRating.toFixed(1)} out of 5
                </span>
              </div>
              <span className="text-sm sm:text-lg text-gray-600">
                {tournament._count?.reviews || 0} reviews
              </span>
            </div>

            {isAuthenticated ? (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center justify-center text-sm sm:text-base"
              >
                <Plus className="h-4 w-4 mr-2" />
                Write Review
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center justify-center text-sm sm:text-base"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Login to Write Review
                </Link>
                <p className="text-xs text-gray-500 text-center sm:text-left">
                  Account required • One review per tournament
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Write a Review</h2>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setReviewForm({ ...reviewForm, overall_rating: rating })}
                    className={`transition-colors p-1 ${
                      rating <= reviewForm.overall_rating
                        ? 'text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  >
                    <Star className={`h-5 w-5 sm:h-6 sm:w-6 ${rating <= reviewForm.overall_rating ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
              <textarea
                rows={3}
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="Share your experience with this tournament..."
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                type="submit"
                disabled={createReviewMutation.isLoading}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {createReviewMutation.isLoading ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews Section */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
          Reviews ({tournament._count?.reviews || 0})
        </h2>
        
        {reviewsLoading && <LoadingSpinner />}
        
        <div className="space-y-4 sm:space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-4 sm:pb-6 last:border-b-0 last:pb-0">
              <div className="mb-3">
                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Anonymous Reviewer</h4>
                  <span className="text-xs sm:text-sm text-gray-600">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center mt-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 sm:h-4 sm:w-4 ${
                          i < review.overall_rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              {review.comment && (
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{review.comment}</p>
              )}
            </div>
          ))}
          
          {reviews.length === 0 && !reviewsLoading && (
            <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
              No reviews yet. Be the first to review this tournament!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentDetailPage;