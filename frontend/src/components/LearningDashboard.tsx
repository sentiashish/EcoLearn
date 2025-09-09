import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AcademicCapIcon,
  TrophyIcon,
  FireIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  PlayIcon,
  BookOpenIcon,
  PuzzlePieceIcon,
  GlobeAltIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import {
  TrophyIcon as TrophyIconSolid,
  StarIcon as StarIconSolid,
  FireIcon as FireIconSolid,
  HeartIcon as HeartIconSolid
} from '@heroicons/react/24/solid';

import GamificationSystem from './GamificationSystem';
import InteractiveQuiz from './InteractiveQuiz';
import ProgressTracker from './ProgressTracker';
import EnvironmentalMiniGames, { GameResult } from './EnvironmentalMiniGames';
import EcosystemBuilder from './EcosystemBuilder';

interface UserStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
  streak: number;
  badges: string[];
  achievements: string[];
  coursesCompleted: number;
  quizzesCompleted: number;
  gamesPlayed: number;
  studyTimeToday: number;
  weeklyGoalProgress: number;
}

interface Activity {
  id: string;
  type: 'course' | 'quiz' | 'game' | 'achievement';
  title: string;
  description: string;
  xpEarned: number;
  timestamp: Date;
  icon: string;
}

interface LearningDashboardProps {
  onClose?: () => void;
}

const LearningDashboard: React.FC<LearningDashboardProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'games' | 'progress' | 'achievements'>('overview');
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    level: 12,
    xp: 2450,
    xpToNextLevel: 550,
    totalXp: 15750,
    streak: 7,
    badges: ['eco-warrior', 'quiz-master', 'carbon-neutral', 'recycling-champion'],
    achievements: ['First Steps', 'Week Warrior', 'Knowledge Seeker', 'Game Master', 'Eco Champion'],
    coursesCompleted: 8,
    quizzesCompleted: 24,
    gamesPlayed: 15,
    studyTimeToday: 45,
    weeklyGoalProgress: 78
  });
  
  const [recentActivities, setRecentActivities] = useState<Activity[]>([
    {
      id: '1',
      type: 'achievement',
      title: 'Eco Champion',
      description: 'Completed Carbon Footprint Calculator with perfect score',
      xpEarned: 100,
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      icon: '🏆'
    },
    {
      id: '2',
      type: 'quiz',
      title: 'Climate Change Basics',
      description: 'Scored 95% on climate science quiz',
      xpEarned: 75,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      icon: '🧠'
    },
    {
      id: '3',
      type: 'game',
      title: 'Ecosystem Builder',
      description: 'Created a balanced forest ecosystem',
      xpEarned: 120,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      icon: '🌳'
    },
    {
      id: '4',
      type: 'course',
      title: 'Renewable Energy',
      description: 'Completed Solar Power module',
      xpEarned: 150,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      icon: '☀️'
    }
  ]);

  const [weeklyProgress, setWeeklyProgress] = useState([
    { day: 'Mon', xp: 120, studyTime: 30 },
    { day: 'Tue', xp: 200, studyTime: 45 },
    { day: 'Wed', xp: 150, studyTime: 25 },
    { day: 'Thu', xp: 300, studyTime: 60 },
    { day: 'Fri', xp: 180, studyTime: 35 },
    { day: 'Sat', xp: 250, studyTime: 50 },
    { day: 'Sun', xp: 220, studyTime: 40 }
  ]);

  const handleGameComplete = (gameType: string, result: GameResult) => {
    // Update user stats
    setUserStats(prev => ({
      ...prev,
      xp: prev.xp + result.xpEarned,
      totalXp: prev.totalXp + result.xpEarned,
      gamesPlayed: prev.gamesPlayed + 1,
      achievements: result.achievements ? [...prev.achievements, ...result.achievements] : prev.achievements
    }));

    // Add to recent activities
    const newActivity: Activity = {
      id: Date.now().toString(),
      type: 'game',
      title: gameType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      description: `Scored ${result.score} points with ${Math.round(result.accuracy)}% accuracy`,
      xpEarned: result.xpEarned,
      timestamp: new Date(),
      icon: gameType.includes('carbon') ? '🌍' : gameType.includes('recycling') ? '♻️' : '🎮'
    };
    
    setRecentActivities(prev => [newActivity, ...prev.slice(0, 9)]);
    setSelectedGame(null);
  };

  const handleQuizComplete = (result: any) => {
    setUserStats(prev => ({
      ...prev,
      xp: prev.xp + result.xpEarned,
      totalXp: prev.totalXp + result.xpEarned,
      quizzesCompleted: prev.quizzesCompleted + 1,
      streak: result.accuracy > 80 ? prev.streak + 1 : 0
    }));

    const newActivity: Activity = {
      id: Date.now().toString(),
      type: 'quiz',
      title: 'Environmental Quiz',
      description: `Scored ${Math.round(result.accuracy)}% accuracy`,
      xpEarned: result.xpEarned,
      timestamp: new Date(),
      icon: '🧠'
    };
    
    setRecentActivities(prev => [newActivity, ...prev.slice(0, 9)]);
    setShowQuiz(false);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'course': return 'bg-blue-100 text-blue-800';
      case 'quiz': return 'bg-purple-100 text-purple-800';
      case 'game': return 'bg-green-100 text-green-800';
      case 'achievement': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (showQuiz) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <InteractiveQuiz onComplete={handleQuizComplete} onClose={() => setShowQuiz(false)} />
      </div>
    );
  }

  if (selectedGame === 'mini-games') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <EnvironmentalMiniGames 
          onGameComplete={handleGameComplete} 
          onClose={() => setSelectedGame(null)} 
        />
      </div>
    );
  }

  if (selectedGame === 'ecosystem-builder') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <EcosystemBuilder 
          onComplete={(result) => handleGameComplete('ecosystem-builder', result)} 
          onClose={() => setSelectedGame(null)} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Learning Dashboard</h1>
              <p className="text-gray-600 mt-1">Track your environmental education journey</p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex space-x-8 border-b border-gray-200">
            {[
              { id: 'overview', label: 'Overview', icon: ChartBarIcon },
              { id: 'games', label: 'Games', icon: PuzzlePieceIcon },
              { id: 'progress', label: 'Progress', icon: ArrowTrendingUpIcon },
              { id: 'achievements', label: 'Achievements', icon: TrophyIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <BoltIcon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Current Level</p>
                    <p className="text-2xl font-bold text-gray-900">{userStats.level}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>XP Progress</span>
                    <span>{userStats.xp}/{userStats.xp + userStats.xpToNextLevel}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(userStats.xp / (userStats.xp + userStats.xpToNextLevel)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                      <FireIconSolid className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Study Streak</p>
                    <p className="text-2xl font-bold text-gray-900">{userStats.streak} days</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Keep it up! 🔥</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <TrophyIconSolid className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Achievements</p>
                    <p className="text-2xl font-bold text-gray-900">{userStats.achievements.length}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Badges earned: {userStats.badges.length}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <ClockIcon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Study Time Today</p>
                    <p className="text-2xl font-bold text-gray-900">{userStats.studyTimeToday}m</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Goal: 60 minutes</p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Weekly Progress Chart */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Progress</h3>
                <div className="space-y-4">
                  {weeklyProgress.map((day, index) => (
                    <div key={day.day} className="flex items-center gap-4">
                      <div className="w-12 text-sm font-medium text-gray-600">{day.day}</div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>XP: {day.xp}</span>
                          <span>Study: {day.studyTime}m</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(day.xp / 300) * 100}%` }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                          ></motion.div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activities */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                <div className="space-y-4">
                  {recentActivities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="text-2xl">{activity.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                        <p className="text-xs text-gray-500 truncate">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getActivityTypeColor(activity.type)}`}>
                            +{activity.xpEarned} XP
                          </span>
                          <span className="text-xs text-gray-400">{formatTimeAgo(activity.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setShowQuiz(true)}
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all"
                >
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <BookOpenIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Take Quiz</p>
                    <p className="text-sm text-gray-500">Test your knowledge</p>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedGame('mini-games')}
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all"
                >
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <PlayIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Play Games</p>
                    <p className="text-sm text-gray-500">Learn through play</p>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedGame('ecosystem-builder')}
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all"
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <GlobeAltIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Build Ecosystem</p>
                    <p className="text-sm text-gray-500">Create & simulate</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Games Tab */}
        {activeTab === 'games' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Environmental Learning Games</h2>
              <p className="text-gray-600">Learn about the environment through interactive games and simulations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Interactive Quiz */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer"
                onClick={() => setShowQuiz(true)}
              >
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
                  <div className="text-4xl mb-2">🧠</div>
                  <h3 className="text-xl font-bold">Interactive Quiz</h3>
                  <p className="opacity-90">Test your environmental knowledge</p>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Difficulty:</span>
                      <span className="font-medium text-green-600">Adaptive</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">5-10 min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">XP Reward:</span>
                      <span className="font-medium text-blue-600">50-150 XP</span>
                    </div>
                  </div>
                  <button className="w-full mt-4 bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                    Start Quiz
                  </button>
                </div>
              </motion.div>

              {/* Mini Games */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer"
                onClick={() => setSelectedGame('mini-games')}
              >
                <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 text-white">
                  <div className="text-4xl mb-2">🎮</div>
                  <h3 className="text-xl font-bold">Mini Games</h3>
                  <p className="opacity-90">Carbon calculator & recycling sorter</p>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Games:</span>
                      <span className="font-medium text-green-600">2 Available</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">2-5 min each</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">XP Reward:</span>
                      <span className="font-medium text-blue-600">30-150 XP</span>
                    </div>
                  </div>
                  <button className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors">
                    Play Games
                  </button>
                </div>
              </motion.div>

              {/* Ecosystem Builder */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer"
                onClick={() => setSelectedGame('ecosystem-builder')}
              >
                <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-6 text-white">
                  <div className="text-4xl mb-2">🌍</div>
                  <h3 className="text-xl font-bold">Ecosystem Builder</h3>
                  <p className="opacity-90">Create and manage ecosystems</p>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Complexity:</span>
                      <span className="font-medium text-orange-600">Advanced</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">10-20 min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">XP Reward:</span>
                      <span className="font-medium text-blue-600">100-300 XP</span>
                    </div>
                  </div>
                  <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Build Ecosystem
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="space-y-8">
            <ProgressTracker />
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="space-y-8">
            <GamificationSystem view="full" />
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningDashboard;