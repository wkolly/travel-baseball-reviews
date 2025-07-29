import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, X } from 'lucide-react';
import { tournamentsAPI } from '@/services/api';
import { CreateTournamentRequest } from '@travel-baseball/shared';
import LoadingSpinner from '@/components/LoadingSpinner';

const CreateTournamentPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTournamentRequest>();

  const createTournamentMutation = useMutation(tournamentsAPI.createTournament, {
    onSuccess: () => {
      toast.success('Tournament created successfully!');
      queryClient.invalidateQueries('tournaments');
      navigate('/tournaments');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create tournament');
    },
  });

  const onSubmit = (data: CreateTournamentRequest) => {
    createTournamentMutation.mutate(data);
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate('/tournaments');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate('/tournaments')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tournaments
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Create Tournament
        </h1>
        <p className="text-lg text-gray-600">
          Add a new tournament to the directory. It will be immediately available for reviews.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold">Tournament Information</h2>
          </div>
          <div className="card-body space-y-6">
            {/* Tournament Name */}
            <div>
              <label htmlFor="name" className="form-label">
                Tournament Name *
              </label>
              <input
                {...register('name', {
                  required: 'Tournament name is required',
                  minLength: {
                    value: 2,
                    message: 'Tournament name must be at least 2 characters',
                  },
                })}
                type="text"
                id="name"
                className="form-input"
                placeholder="Enter tournament name"
              />
              {errors.name && (
                <p className="form-error">{errors.name.message}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="form-label">
                Location *
              </label>
              <input
                {...register('location', {
                  required: 'Location is required',
                  minLength: {
                    value: 2,
                    message: 'Location must be at least 2 characters',
                  },
                })}
                type="text"
                id="location"
                className="form-input"
                placeholder="Enter city and state (e.g., Atlanta, GA)"
              />
              {errors.location && (
                <p className="form-error">{errors.location.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="form-label">
                Tournament Description
              </label>
              <textarea
                {...register('description')}
                id="description"
                rows={4}
                className="form-textarea"
                placeholder="Describe the tournament format, age groups, dates, entry fees, and any special features..."
              />
              <p className="text-sm text-gray-500 mt-1">
                A good description helps families understand what to expect from your tournament
              </p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="btn-secondary inline-flex items-center"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={createTournamentMutation.isLoading}
            className="btn-primary inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createTournamentMutation.isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Tournament
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTournamentPage;