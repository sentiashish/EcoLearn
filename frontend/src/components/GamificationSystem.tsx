import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrophyIcon,
  FireIcon,
  StarIcon,
  BoltIcon,
  HeartIcon,
  ShieldCheckIcon,
  SparklesIcon,
  GiftIcon,
  ChartBarIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import {
  TrophyIcon as TrophyIconSolid,
  FireIcon as FireIconSolid,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  badge?: Badge;
  completed: boolean;
  progress: number;
  maxProgress: number;
  category: string;
}

interface UserStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
  streak: number;
  longestStreak: number;
  badges: Badge[];
  achievements: Achievement[];
  rank: string;
  weeklyXp: number;
  monthlyXp: number;
}

interface GamificationSystemProps {
  userStats: UserStats;
  showNotifications?: boolean;
  compact?: boolean;
}

const GamificationSystem: React.FC<GamificationSystemProps> = ({
  userStats,
  showNotifications = true,
  compact = false
}) => {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showBadgeUnlock, setShowBadgeUnlock] = useState<Badge | null>(null);
  const [showXpGain, setShowXpGain] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'badges' | 'achievements'>('overview');

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-yellow-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'eco-novice': return 'text-green-600';
      case 'earth-guardian': return 'text-blue-600';
      case 'climate-champion': return 'text-purple-600';
      case 'planet-protector': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getXpPercentage = () => {
    return ((userStats.totalXp - (userStats.totalXp - userStats.xp)) / userStats.xpToNextLevel) * 100;
  };

  const triggerXpGain = (amount: number) => {
    setShowXpGain(amount);
    setTimeout(() => setShowXpGain(null), 2000);
  };

  const triggerLevelUp = () => {
    setShowLevelUp(true);
    setTimeout(() => setShowLevelUp(false), 3000);
  };

  const triggerBadgeUnlock = (badge: Badge) => {
    setShowBadgeUnlock(badge);
    setTimeout(() => setShowBadgeUnlock(null), 3000);
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {userStats.level}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{userStats.rank}</h3>
              <p className="text-sm text-gray-600">{userStats.xp} / {userStats.xpToNextLevel} XP</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-orange-600">
              <FireIconSolid className="h-4 w-4" />
              <span className="text-sm font-medium">{userStats.streak}</span>
            </div>
            <div className="flex items-center gap-1 text-yellow-600">
              <TrophyIconSolid className="h-4 w-4" />
              <span className="text-sm font-medium">{userStats.badges.filter(b => b.unlocked).length}</span>
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${getXpPercentage()}%` }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">Level {userStats.level}</h2>
            <p className={`text-lg font-medium ${getRankColor(userStats.rank)}`}>{userStats.rank}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{userStats.xp.toLocaleString()}</div>
            <div className="text-sm opacity-90">XP Points</div>
          </div>
        </div>
        
        {/* XP Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress to Level {userStats.level + 1}</span>
            <span>{userStats.xp} / {userStats.xpToNextLevel}</span>
          </div>
          <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
            <motion.div
              className="bg-white h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${getXpPercentage()}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            ></motion.div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <FireIconSolid className="h-5 w-5 text-orange-300" />
              <span className="text-xl font-bold">{userStats.streak}</span>
            </div>
            <div className="text-xs opacity-90">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrophyIconSolid className="h-5 w-5 text-yellow-300" />
              <span className="text-xl font-bold">{userStats.badges.filter(b => b.unlocked).length}</span>
            </div>
            <div className="text-xs opacity-90">Badges</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <StarIconSolid className="h-5 w-5 text-blue-300" />
              <span className="text-xl font-bold">{userStats.achievements.filter(a => a.completed).length}</span>
            </div>
            <div className="text-xs opacity-90">Achievements</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'badges', label: 'Badges', icon: ShieldCheckIcon },
            { id: 'achievements', label: 'Achievements', icon: TrophyIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                selectedTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Weekly Progress */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CalendarDaysIcon className="h-5 w-5" />
                This Week's Progress
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-green-600">{userStats.weeklyXp}</div>
                  <div className="text-sm text-gray-600">XP Earned</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{userStats.monthlyXp}</div>
                  <div className="text-sm text-gray-600">Monthly XP</div>
                </div>
              </div>
            </div>

            {/* Recent Achievements */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Recent Achievements</h3>
              <div className="space-y-2">
                {userStats.achievements
                  .filter(a => a.completed)
                  .slice(0, 3)
                  .map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <TrophyIconSolid className="h-6 w-6 text-yellow-500" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{achievement.title}</div>
                        <div className="text-sm text-gray-600">{achievement.description}</div>
                      </div>
                      <div className="text-green-600 font-medium">+{achievement.xpReward} XP</div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'badges' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {userStats.badges.map((badge) => (
                <motion.div
                  key={badge.id}
                  whileHover={{ scale: 1.05 }}
                  className={`relative p-4 rounded-lg border-2 transition-all ${
                    badge.unlocked
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r ${getRarityColor(badge.rarity)} flex items-center justify-center text-2xl`}>
                      {badge.icon}
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">{badge.name}</h4>
                    <p className="text-xs text-gray-600 mb-2">{badge.description}</p>
                    <div className={`text-xs font-medium capitalize ${
                      badge.rarity === 'legendary' ? 'text-yellow-600' :
                      badge.rarity === 'epic' ? 'text-purple-600' :
                      badge.rarity === 'rare' ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {badge.rarity}
                    </div>
                    {badge.progress !== undefined && badge.maxProgress && !badge.unlocked && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-green-500 h-1 rounded-full"
                            style={{ width: `${(badge.progress / badge.maxProgress) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {badge.progress} / {badge.maxProgress}
                        </div>
                      </div>
                    )}
                  </div>
                  {badge.unlocked && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <SparklesIcon className="h-4 w-4 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'achievements' && (
          <div className="space-y-4">
            {userStats.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border transition-all ${
                  achievement.completed
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <TrophyIcon className={`h-5 w-5 ${
                        achievement.completed ? 'text-yellow-500' : 'text-gray-400'
                      }`} />
                      <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {achievement.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                    {!achievement.completed && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{achievement.progress} / {achievement.maxProgress}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-green-600 font-medium">+{achievement.xpReward} XP</div>
                    {achievement.completed && (
                      <div className="text-xs text-green-600 mt-1">Completed!</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {showNotifications && showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed bottom-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-lg shadow-lg z-50"
          >
            <div className="flex items-center gap-3">
              <SparklesIcon className="h-8 w-8" />
              <div>
                <div className="font-bold text-lg">Level Up!</div>
                <div className="text-sm opacity-90">You reached level {userStats.level}!</div>
              </div>
            </div>
          </motion.div>
        )}

        {showNotifications && showBadgeUnlock && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed bottom-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-lg shadow-lg z-50"
          >
            <div className="flex items-center gap-3">
              <div className="text-3xl">{showBadgeUnlock.icon}</div>
              <div>
                <div className="font-bold text-lg">Badge Unlocked!</div>
                <div className="text-sm opacity-90">{showBadgeUnlock.name}</div>
              </div>
            </div>
          </motion.div>
        )}

        {showNotifications && showXpGain && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
          >
            <div className="flex items-center gap-2">
              <BoltIcon className="h-5 w-5" />
              <span className="font-medium">+{showXpGain} XP</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GamificationSystem;
export type { UserStats, Badge, Achievement };

// Mock data for testing
export const mockUserStats: UserStats = {
  level: 12,
  xp: 2450,
  xpToNextLevel: 3000,
  totalXp: 15450,
  streak: 7,
  longestStreak: 21,
  rank: "Earth Guardian",
  weeklyXp: 850,
  monthlyXp: 3200,
  badges: [
    {
      id: 'first-lesson',
      name: 'First Steps',
      description: 'Complete your first lesson',
      icon: '🌱',
      rarity: 'common',
      unlocked: true,
      unlockedAt: new Date('2024-01-15')
    },
    {
      id: 'week-streak',
      name: 'Consistent Learner',
      description: 'Maintain a 7-day learning streak',
      icon: '🔥',
      rarity: 'rare',
      unlocked: true,
      unlockedAt: new Date('2024-01-20')
    },
    {
      id: 'challenge-master',
      name: 'Challenge Master',
      description: 'Complete 10 coding challenges',
      icon: '💻',
      rarity: 'epic',
      unlocked: false,
      progress: 7,
      maxProgress: 10
    },
    {
      id: 'eco-champion',
      name: 'Eco Champion',
      description: 'Reach level 25',
      icon: '🏆',
      rarity: 'legendary',
      unlocked: false,
      progress: 12,
      maxProgress: 25
    }
  ],
  achievements: [
    {
      id: 'first-course',
      title: 'Course Completion',
      description: 'Complete your first environmental course',
      xpReward: 100,
      completed: true,
      progress: 1,
      maxProgress: 1,
      category: 'Learning'
    },
    {
      id: 'challenge-solver',
      title: 'Problem Solver',
      description: 'Solve 5 environmental challenges',
      xpReward: 250,
      completed: false,
      progress: 3,
      maxProgress: 5,
      category: 'Challenges'
    },
    {
      id: 'community-helper',
      title: 'Community Helper',
      description: 'Help 10 fellow learners in discussions',
      xpReward: 200,
      completed: false,
      progress: 2,
      maxProgress: 10,
      category: 'Community'
    }
  ]
};