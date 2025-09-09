import React, { useState } from 'react';
import { LeaderboardEntry, PaginatedResponse } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useGamification } from '@/hooks/useApi';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  TrophyIcon, 
  FireIcon, 
  GlobeAltIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { 
  TrophyIcon as TrophySolidIcon
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Use React Query hooks
  const { data: leaderboard, isLoading: loading } = useGamification.getLeaderboard({ 
    period, 
    page: currentPage 
  });

  const handlePeriodChange = (newPeriod: 'week' | 'month' | 'all') => {
    setPeriod(newPeriod);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <TrophySolidIcon className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <TrophySolidIcon className="h-6 w-6 text-gray-400" />;
      case 3:
        return <TrophySolidIcon className="h-6 w-6 text-amber-600" />;
      default:
        return (
          <div className="h-6 w-6 flex items-center justify-center bg-gray-100 rounded-full text-sm font-medium text-gray-600">
            {rank}
          </div>
        );
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getCurrentUserRank = () => {
    if (!user || !leaderboard) return null;
    return leaderboard.results.find(entry => entry.user.id === user.id);
  };

  const totalPages = leaderboard ? Math.ceil(leaderboard.count / 10) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🌱 Eco-Champions Leaderboard
        </h1>
        <p className="text-gray-600">
          See how you rank among environmental champions making a difference for our planet
        </p>
      </div>

      {/* Period Filter */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-1">
          {(['week', 'month', 'all'] as const).map((periodOption) => (
            <button
              key={periodOption}
              onClick={() => handlePeriodChange(periodOption)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                period === periodOption
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {periodOption === 'week' && 'This Week'}
              {periodOption === 'month' && 'This Month'}
              {periodOption === 'all' && 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Current User Stats */}
      {getCurrentUserRank() && (
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Your Current Ranking</h3>
              <div className="flex items-center gap-6">
                <div className="flex items-center">
                  <TrophyIcon className="h-5 w-5 mr-2" />
                  <span className="text-sm">Rank #{getCurrentUserRank()?.rank}</span>
                </div>
                <div className="flex items-center">
                  <FireIcon className="h-5 w-5 mr-2" />
                  <span className="text-sm">{getCurrentUserRank()?.total_points.toLocaleString()} eco-points</span>
                </div>
                <div className="flex items-center">
                  <GlobeAltIcon className="h-5 w-5 mr-2" />
                  <span className="text-sm">{getCurrentUserRank()?.challenges_solved} eco-challenges completed</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">Level {getCurrentUserRank()?.level}</div>
              <div className="text-sm opacity-90">Keep going! 🚀</div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {leaderboard && leaderboard.results.length > 0 ? (
          <>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Top Performers ({period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'All Time'})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Eco-Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Eco-Challenges Completed
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboard.results.map((entry) => (
                    <tr 
                      key={entry.user.id} 
                      className={`hover:bg-gray-50 ${
                        entry.user.id === user?.id ? 'bg-blue-50 border-l-4 border-primary-500' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getRankIcon(entry.rank)}
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getRankBadge(entry.rank)}`}>
                            #{entry.rank}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 flex items-center justify-center text-white font-medium">
                              {entry.user.first_name.charAt(0)}{entry.user.last_name.charAt(0)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {entry.user.first_name} {entry.user.last_name}
                              {entry.user.id === user?.id && (
                                <span className="ml-2 text-xs text-primary-600 font-medium">(You)</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {entry.user.role}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FireIcon className="h-4 w-4 text-orange-500 mr-1" />
                          <span className="text-sm font-medium text-gray-900">{entry.level}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <TrophyIcon className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-sm font-medium text-gray-900">
                            {entry.total_points.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <GlobeAltIcon className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm font-medium text-gray-900">
                            {entry.challenges_solved}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * 10, leaderboard.count)}
                      </span>{' '}
                      of <span className="font-medium">{leaderboard.count}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeftIcon className="h-5 w-5" />
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === page
                                ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRightIcon className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <TrophyIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No rankings available</h3>
            <p className="mt-1 text-sm text-gray-500">
              Complete some challenges to appear on the leaderboard!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;