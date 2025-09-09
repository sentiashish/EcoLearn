import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  ChartBarIcon,
  TrophyIcon,
  BookOpenIcon,
  ClockIcon,
  FireIcon,
  StarIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  GlobeAltIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import LearningDashboard from '../components/LearningDashboard';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

interface UserStats {
  totalLessons: number;
  completedLessons: number;
  totalChallenges: number;
  completedChallenges: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  rank: number;
  totalUsers: number;
  weeklyProgress: number[];
  categoryProgress: { [key: string]: number };
  recentAchievements: Achievement[];
  upcomingGoals: Goal[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
  points: number;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  deadline: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [showLearningDashboard, setShowLearningDashboard] = useState(false);

  useEffect(() => {
    // Mock data - replace with actual API calls
    const mockStats: UserStats = {
      totalLessons: 24,
      completedLessons: 18,
      totalChallenges: 12,
      completedChallenges: 8,
      totalPoints: 2450,
      currentStreak: 7,
      longestStreak: 15,
      rank: 23,
      totalUsers: 1247,
      weeklyProgress: [120, 180, 240, 320, 280, 380, 420],
      categoryProgress: {
        'Climate Change': 85,
        'Renewable Energy': 72,
        'Waste Management': 90,
        'Water Conservation': 65,
        'Sustainable Living': 78
      },
      recentAchievements: [
        {
          id: '1',
          title: 'Eco Warrior',
          description: 'Completed 10 environmental challenges',
          icon: '🌱',
          earnedAt: '2024-01-15',
          points: 100
        },
        {
          id: '2',
          title: 'Knowledge Seeker',
          description: 'Completed 15 lessons',
          icon: '📚',
          earnedAt: '2024-01-12',
          points: 75
        },
        {
          id: '3',
          title: 'Streak Master',
          description: 'Maintained 7-day learning streak',
          icon: '🔥',
          earnedAt: '2024-01-10',
          points: 50
        }
      ],
      upcomingGoals: [
        {
          id: '1',
          title: 'Complete Climate Module',
          description: 'Finish all climate change lessons',
          progress: 6,
          target: 8,
          deadline: '2024-01-25'
        },
        {
          id: '2',
          title: 'Weekly Challenge',
          description: 'Complete 3 challenges this week',
          progress: 2,
          target: 3,
          deadline: '2024-01-21'
        }
      ]
    };

    setTimeout(() => {
      setStats(mockStats);
      setLoading(false);
    }, 1000);
  }, []);

  const progressChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Points Earned',
        data: stats?.weeklyProgress || [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const categoryChartData = {
    labels: Object.keys(stats?.categoryProgress || {}),
    datasets: [
      {
        data: Object.values(stats?.categoryProgress || {}),
        backgroundColor: [
          '#10B981',
          '#3B82F6',
          '#8B5CF6',
          '#F59E0B',
          '#EF4444',
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
    },
  };

  if (showLearningDashboard) {
    return <LearningDashboard onClose={() => setShowLearningDashboard(false)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.first_name}! 👋
            </h1>
            <p className="text-gray-600 mt-2">
              Track your environmental learning journey and achievements
            </p>
          </div>
          <button 
            onClick={() => setShowLearningDashboard(true)}
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-200 flex items-center gap-2 shadow-lg"
          >
            <SparklesIcon className="h-5 w-5" />
            Interactive Learning
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Points</p>
                <p className="text-3xl font-bold text-emerald-600">{stats.totalPoints.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <StarIcon className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+12%</span>
              <span className="text-gray-500 ml-1">from last week</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Streak</p>
                <p className="text-3xl font-bold text-orange-600">{stats.currentStreak}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FireIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">Longest: {stats.longestStreak} days</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lessons Completed</p>
                <p className="text-3xl font-bold text-blue-600">{stats.completedLessons}/{stats.totalLessons}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpenIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.completedLessons / stats.totalLessons) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Global Rank</p>
                <p className="text-3xl font-bold text-purple-600">#{stats.rank}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrophyIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">out of {stats.totalUsers.toLocaleString()} users</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Progress Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Weekly Progress</h3>
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
            <div className="h-64">
              <Line data={progressChartData} options={chartOptions} />
            </div>
          </div>

          {/* Category Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Learning Categories</h3>
            <div className="h-64">
              <Doughnut data={categoryChartData} options={doughnutOptions} />
            </div>
          </div>
        </div>

        {/* Achievements and Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Achievements */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <TrophyIcon className="h-5 w-5 text-yellow-500 mr-2" />
              Recent Achievements
            </h3>
            <div className="space-y-4">
              {stats.recentAchievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="text-2xl mr-4">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Earned on {new Date(achievement.earnedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      +{achievement.points} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Goals */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <CalendarDaysIcon className="h-5 w-5 text-blue-500 mr-2" />
              Upcoming Goals
            </h3>
            <div className="space-y-4">
              {stats.upcomingGoals.map((goal) => (
                <div key={goal.id} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                    <span className="text-sm text-gray-500">
                      Due {new Date(goal.deadline).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(goal.progress / goal.target) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {goal.progress}/{goal.target}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;