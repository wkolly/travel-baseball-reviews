import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, X } from 'lucide-react';
import { teamsAPI } from '@/services/api';
import { CreateTeamRequest } from '@travel-baseball/shared';
import LoadingSpinner from '@/components/LoadingSpinner';

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

const CreateTeamPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTeamRequest>();

  const createTeamMutation = useMutation(teamsAPI.createTeam, {
    onSuccess: () => {
      toast.success('Thanks! Your team suggestion is under review.');
      queryClient.invalidateQueries('teams');
      navigate('/teams');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit team suggestion');
    },
  });

  const onSubmit = (data: CreateTeamRequest) => {
    if (selectedAgeGroups.length === 0) {
      toast.error('Please select at least one age group');
      return;
    }

    const teamData = {
      ...data,
      ageGroups: selectedAgeGroups,
    };

    createTeamMutation.mutate(teamData);
  };

  const handleAgeGroupToggle = (ageGroup: string) => {
    setSelectedAgeGroups(prev => 
      prev.includes(ageGroup)
        ? prev.filter(ag => ag !== ageGroup)
        : [...prev, ageGroup].sort()
    );
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate('/teams');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate('/teams')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Teams
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Suggest a Team
        </h1>
        <p className="text-lg text-gray-600">
          Suggest a team for review. It will appear on the site once approved.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold">Basic Information</h2>
          </div>
          <div className="card-body space-y-6">
            {/* Team Name */}
            <div>
              <label htmlFor="name" className="form-label">
                Team Name *
              </label>
              <input
                {...register('name', {
                  required: 'Team name is required',
                  minLength: {
                    value: 2,
                    message: 'Team name must be at least 2 characters',
                  },
                })}
                type="text"
                id="name"
                className="form-input"
                placeholder="Enter your team name"
              />
              {errors.name && (
                <p className="form-error">{errors.name.message}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="form-label">
                Location (City) *
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
                placeholder="Enter city name"
              />
              {errors.location && (
                <p className="form-error">{errors.location.message}</p>
              )}
            </div>

            {/* State */}
            <div>
              <label htmlFor="state" className="form-label">
                State *
              </label>
              <select
                {...register('state', {
                  required: 'State is required',
                })}
                id="state"
                className="form-select"
              >
                <option value="">Select a state</option>
                {US_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              {errors.state && (
                <p className="form-error">{errors.state.message}</p>
              )}
            </div>

            {/* Age Groups */}
            <div>
              <label className="form-label">
                Age Groups *
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Select all age groups your team accepts
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {AGE_GROUPS.map((ageGroup) => (
                  <button
                    key={ageGroup}
                    type="button"
                    onClick={() => handleAgeGroupToggle(ageGroup)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      selectedAgeGroups.includes(ageGroup)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {ageGroup}
                  </button>
                ))}
              </div>
              {selectedAgeGroups.length === 0 && (
                <p className="form-error mt-2">Please select at least one age group</p>
              )}
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
            disabled={createTeamMutation.isLoading}
            className="btn-primary inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createTeamMutation.isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Suggest Team
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTeamPage;