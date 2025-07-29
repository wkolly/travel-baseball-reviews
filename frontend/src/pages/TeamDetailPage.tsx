import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Star, Users, ArrowLeft, Plus } from 'lucide-react';
import { useTeam } from '@/hooks/useTeams';
import { useTeamReviews, useCreateReview } from '@/hooks/useReviews';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Review {
  id: string;
  userId: string;
  coaching_rating: number;
  value_rating: number;
  organization_rating: number;
  playing_time_rating: number;
  overall_rating: number;
  comment?: string;
  createdAt: string;
}

const TeamDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    coaching_rating: 0,
    value_rating: 0,
    organization_rating: 0,
    playing_time_rating: 0,
    overall_rating: 0,
    comment: ''
  });

  const { data: teamResponse, isLoading: teamLoading, error: teamError } = useTeam(id!);
  const { data: reviewsResponse, isLoading: reviewsLoading } = useTeamReviews(id!);
  const createReviewMutation = useCreateReview(id!);

  if (teamLoading) return <LoadingSpinner />;
  if (teamError) return <div className="text-center py-8 text-red-600">Error loading team details</div>;
  if (!teamResponse?.data) return <div className="text-center py-8">Team not found</div>;

  const team = teamResponse.data;
  const reviews = reviewsResponse?.data?.reviews || [];
  const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length : 0;
  
  // Parse ageGroups from JSON string to array with error handling
  const ageGroups = (() => {
    try {
      if (typeof team.ageGroups === 'string') {
        const parsed = JSON.parse(team.ageGroups);
        return Array.isArray(parsed) ? parsed : [];
      }
      return Array.isArray(team.ageGroups) ? team.ageGroups : [];
    } catch (error) {
      console.error('Error parsing ageGroups:', error);
      return [];
    }
  })();

  const handleRatingChange = (category: string, rating: number) => {
    setReviewForm(prev => ({ ...prev, [category]: rating }));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate overall rating as average of all ratings
    const overallRating = (
      reviewForm.coaching_rating + 
      reviewForm.value_rating + 
      reviewForm.organization_rating + 
      reviewForm.playing_time_rating
    ) / 4;

    try {
      await createReviewMutation.mutateAsync({
        ...reviewForm,
        overall_rating: overallRating
      });
      
      // Reset form and close
      setReviewForm({
        coaching_rating: 0,
        value_rating: 0,
        organization_rating: 0,
        playing_time_rating: 0,
        overall_rating: 0,
        comment: ''
      });
      setShowReviewForm(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/teams"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Teams
        </Link>
      </div>

      {/* Team Header */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{team.name}</h1>
            
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="h-6 w-6 mr-3" />
              <span className="text-xl">{team.location}, {team.state}</span>
            </div>

            <div className="flex items-center text-gray-600 mb-6">
              <Users className="h-5 w-5 mr-2" />
              <span className="text-lg">Age Groups: {ageGroups.join(', ')}</span>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${
                        i < Math.floor(averageRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-3 text-lg text-gray-600">
                  {averageRating.toFixed(1)} out of 5
                </span>
              </div>
              <span className="text-lg text-gray-600">
                {reviews.length} reviews
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

        {/* Team Description */}
        {team.description && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700 leading-relaxed">{team.description}</p>
          </div>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Write a Review</h2>
          <form onSubmit={handleSubmitReview} className="space-y-6">
            {/* Rating Categories */}
            {[
              { key: 'coaching_rating', label: 'Coaching Quality' },
              { key: 'organization_rating', label: 'Team Organization' },
              { key: 'value_rating', label: 'Value for Money' },
              { key: 'playing_time_rating', label: 'Playing Time Fairness' }
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => handleRatingChange(key, rating)}
                      className={`transition-colors ${
                        rating <= reviewForm[key as keyof typeof reviewForm]
                          ? 'text-yellow-400'
                          : 'text-gray-300 hover:text-yellow-400'
                      }`}
                    >
                      <Star className="h-6 w-6 fill-current" />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {reviewForm[key as keyof typeof reviewForm] || 0}/5
                  </span>
                </div>
              </div>
            ))}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
              <textarea
                rows={4}
                value={reviewForm.comment}
                onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Share your experience with this team..."
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={createReviewMutation.isLoading || !reviewForm.coaching_rating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews ({reviews.length})</h2>
        
        {reviewsLoading ? (
          <div className="text-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">Anonymous Review</h4>
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
                
                {/* Rating Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">Coaching:</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < review.coaching_rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">Organization:</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < review.organization_rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">Value:</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < review.value_rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">Playing Time:</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < review.playing_time_rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {review.comment && (
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {reviews.length === 0 && (
          <div className="text-center py-8">
            <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600">Be the first to review this team!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDetailPage;