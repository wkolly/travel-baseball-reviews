import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Trophy, Users, Star, Edit } from 'lucide-react';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Travel Baseball Reviews
          </h1>
          <p className="text-xl text-blue-100">
            Browse and review travel baseball teams and tournaments
          </p>
        </div>
        
        {/* Main Browse/Review Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <Link
            to="/teams"
            className="group bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Teams</h2>
            <p className="text-gray-600 mb-4">
              Browse travel baseball teams and read honest reviews from other families.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <span className="inline-flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
                Browse & Review
                <Star className="h-4 w-4 ml-2" />
              </span>
            </div>
          </Link>

          <Link
            to="/tournaments"
            className="group bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-4 group-hover:bg-yellow-200 transition-colors">
              <Trophy className="h-8 w-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Tournaments</h2>
            <p className="text-gray-600 mb-4">
              Find tournaments and read reviews about organization and competition quality.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <span className="inline-flex items-center text-yellow-600 font-semibold group-hover:text-yellow-700">
                Browse & Review
                <Star className="h-4 w-4 ml-2" />
              </span>
            </div>
          </Link>
        </div>

        
        {!isAuthenticated && (
          <div className="text-center mt-12">
            <p className="text-blue-100 mb-4">Want to suggest a team or create a tournament?</p>
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              <Edit className="h-4 w-4 mr-2" />
              Create Account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;