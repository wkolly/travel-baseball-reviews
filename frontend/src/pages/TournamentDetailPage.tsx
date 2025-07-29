import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { MapPin, Star, ArrowLeft, Plus } from 'lucide-react';
import { tournamentsAPI, tournamentReviewsAPI } from '@/services/api';
import { CreateTournamentReviewRequest } from '@travel-baseball/shared';
import LoadingSpinner from '@/components/LoadingSpinner';

interface TournamentReview {
  id: string;
  overall_rating: number;
  comment?: string;
  createdAt: string;
}

const TournamentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/tournaments"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tournaments
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{tournament.name}</h1>
            
            <div className="flex items-center text-gray-600 mb-6">
              <MapPin className="h-6 w-6 mr-3" />
              <span className="text-xl">{tournament.location}</span>
            </div>

            {tournament.description && (
              <div className="mb-6">
                <p className="text-gray-700 text-lg leading-relaxed">{tournament.description}</p>
              </div>
            )}

            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${
                        i < Math.floor(avgRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-3 text-lg text-gray-600">
                  {avgRating.toFixed(1)} out of 5
                </span>
              </div>
              <span className="text-lg text-gray-600">
                {tournament._count?.reviews || 0} reviews
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Write Review
          </button>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Write a Review</h2>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setReviewForm({ ...reviewForm, overall_rating: rating })}
                    className={`transition-colors ${
                      rating <= reviewForm.overall_rating
                        ? 'text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  >
                    <Star className={`h-6 w-6 ${rating <= reviewForm.overall_rating ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
              <textarea
                rows={4}
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Share your experience with this tournament..."
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={createReviewMutation.isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createReviewMutation.isLoading ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews ({tournament._count?.reviews || 0})</h2>
        
        {reviewsLoading && <LoadingSpinner />}
        
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">Anonymous Reviewer</h4>
                  <div className="flex items-center mt-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.overall_rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              {review.comment && (
                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
              )}
            </div>
          ))}
          
          {reviews.length === 0 && !reviewsLoading && (
            <div className="text-center py-8 text-gray-500">
              No reviews yet. Be the first to review this tournament!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentDetailPage;