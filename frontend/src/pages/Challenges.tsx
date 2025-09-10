// Update frontend/src/pages/Challenges.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CodeBracketIcon,
  ClockIcon,
  StarIcon,
  UserGroupIcon,
  TrophyIcon,
  FireIcon,
  CheckCircleIcon,
  PlayIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { useChallengeData } from '../hooks/useApi';

interface Challenge {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  points: number;
  submissions: number;
  success_rate: number;
  time_limit: string;
  tags: string[];
  is_completed?: boolean;
  best_score?: number;
  best_emission?: number
}

const Challenges: React.FC = () => {
  const { challenges, loading, error, refetch } = useChallengeData();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  const categories = ['All', 'Climate', 'Energy', 'Sustainability', 'Conservation', 'Transportation', 'Water'];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🌱</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Challenges...</h3>
          <p className="text-gray-600">Please wait while we fetch the latest challenges.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Challenges</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const filteredChallenges = challenges.filter((challenge: Challenge) => {
    const matchesCategory = selectedCategory === 'All' || challenge.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || challenge.difficulty === selectedDifficulty;
    const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompleted = !showCompleted || challenge.is_completed;
    return matchesCategory && matchesDifficulty && matchesSearch && (!showCompleted || matchesCompleted);
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 70) return 'text-green-600';
    if (rate >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              🏆 Eco-Challenges
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Solve real-world environmental problems and earn eco-points!
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-lg">
              <div className="flex items-center gap-2">
                <CodeBracketIcon className="h-6 w-6" />
                <span>Interactive Challenges</span>
              </div>
              <div className="flex items-center gap-2">
                <TrophyIcon className="h-6 w-6" />
                <span>Earn Points</span>
              </div>
              <div className="flex items-center gap-2">
                <FireIcon className="h-6 w-6" />
                <span>Track Progress</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{challenges.length}</div>
            <div className="text-gray-600">Total Challenges</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {challenges.filter((c: Challenge) => c.is_completed).length}
            </div>
            <div className="text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {challenges.reduce((sum: number, c: Challenge) => sum + (c.best_score || 0), 0)}
            </div>
            <div className="text-gray-600">Total Points</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {challenges.length > 0 ? 
                Math.round(challenges.reduce((sum: number, c: Challenge) => sum + c.success_rate, 0) / challenges.length) : 0}%
            </div>
            <div className="text-gray-600">Avg Success Rate</div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FunnelIcon className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search challenges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Show Completed Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showCompleted"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="showCompleted" className="ml-2 text-sm text-gray-700">
              Show only completed challenges
            </label>
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredChallenges.map((challenge: Challenge, index: number) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {challenge.category}
                    </span>
                  </div>
                  {challenge.is_completed && (
                    <CheckCircleIcon className="h-6 w-6 text-green-300" />
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2">{challenge.title}</h3>
                <p className="text-blue-100 text-sm">{challenge.description}</p>
              </div>

              {/* Card Body */}
              <div className="p-6">
                {/* Challenge Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <TrophyIcon className="h-4 w-4" />
                    <span>{challenge.points} points</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <ClockIcon className="h-4 w-4" />
                    <span>{challenge.time_limit}</span>
                  </div>
                  {challenge.best_score && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-800">Your Best Score</span>
                        <span className="text-lg font-bold text-green-600">{challenge.best_score}/100</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <StarIcon className="h-4 w-4 text-yellow-400" />
                    <span className={getSuccessRateColor(challenge.success_rate)}>
                      {challenge.success_rate.toFixed(1)}% success
                    </span>
                  </div>
                </div>

                {/* Best Score (if completed) */}
                {challenge.id === 1 && challenge.best_emission && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800">Your Best Emission</span>
                      <span className="text-lg font-bold text-blue-600">
                        {challenge.best_emission.toFixed(2)} kg CO₂/year
                      </span>
                    </div>
                    <div className="mt-1">
                      <span className="text-xs text-blue-600">
                        🌱 Lower is better for the environment
                      </span>
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {challenge.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Link
                  to={`/challenge/${challenge.id}`}
                  className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-3 px-4 rounded-md hover:from-blue-600 hover:to-green-600 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                >
                  {challenge.is_completed ? (
                    <>
                      <PlayIcon className="h-4 w-4" />
                      Try Again
                    </>
                  ) : (
                    <>
                      <CodeBracketIcon className="h-4 w-4" />
                      Start Challenge
                    </>
                  )}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredChallenges.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No challenges found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Make an Impact?
            </h2>
            <p className="text-xl mb-8">
              Join thousands of eco-champions making a real difference!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-blue-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors duration-300"
              >
                Join the Challenge
              </Link>
              <Link
                to="/leaderboard"
                className="border-2 border-white text-white px-8 py-3 rounded-md font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-300"
              >
                View Leaderboard
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Challenges;