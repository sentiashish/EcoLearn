import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  TrophyIcon,
  StarIcon,
  FireIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  BookOpenIcon,
  ClockIcon,
  CheckCircleIcon,
  LockClosedIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import {
  TrophyIcon as TrophyIconSolid,
  StarIcon as StarIconSolid,
  FireIcon as FireIconSolid
} from '@heroicons/react/24/solid';

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'learning' | 'achievement' | 'streak' | 'social' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  requirements: string;
  progress?: number;
  maxProgress?: number;
  earned: boolean;
  earnedAt?: string;
  nextLevel?: Badge;
}

interface Certificate {
  id: string;
  title: string;
  description: string;
  category: string;
  issueDate: string;
  validUntil?: string;
  credentialId: string;
  skills: string[];
  imageUrl: string;
  shareUrl: string;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  type: 'badge' | 'points' | 'certificate' | 'unlock' | 'discount';
  value: number | string;
  claimed: boolean;
  expiresAt?: string;
  requirements: string;
}

const Achievements: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'badges' | 'certificates' | 'rewards'>('badges');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [badges, setBadges] = useState<Badge[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API calls
    const mockBadges: Badge[] = [
      {
        id: '1',
        title: 'First Steps',
        description: 'Complete your first lesson',
        icon: '🌱',
        category: 'learning',
        rarity: 'common',
        points: 10,
        requirements: 'Complete 1 lesson',
        progress: 1,
        maxProgress: 1,
        earned: true,
        earnedAt: '2024-01-10'
      },
      {
        id: '2',
        title: 'Knowledge Seeker',
        description: 'Complete 10 lessons',
        icon: '📚',
        category: 'learning',
        rarity: 'rare',
        points: 50,
        requirements: 'Complete 10 lessons',
        progress: 8,
        maxProgress: 10,
        earned: false
      },
      {
        id: '3',
        title: 'Eco Warrior',
        description: 'Complete 5 environmental challenges',
        icon: '🌍',
        category: 'achievement',
        rarity: 'epic',
        points: 100,
        requirements: 'Complete 5 challenges',
        progress: 3,
        maxProgress: 5,
        earned: false
      },
      {
        id: '4',
        title: 'Streak Master',
        description: 'Maintain a 7-day learning streak',
        icon: '🔥',
        category: 'streak',
        rarity: 'rare',
        points: 75,
        requirements: '7-day streak',
        progress: 7,
        maxProgress: 7,
        earned: true,
        earnedAt: '2024-01-15'
      },
      {
        id: '5',
        title: 'Climate Champion',
        description: 'Master all climate change modules',
        icon: '🏆',
        category: 'special',
        rarity: 'legendary',
        points: 200,
        requirements: 'Complete Climate Change track',
        progress: 0,
        maxProgress: 1,
        earned: false
      }
    ];

    const mockCertificates: Certificate[] = [
      {
        id: '1',
        title: 'Environmental Awareness Fundamentals',
        description: 'Demonstrates understanding of basic environmental concepts and sustainability principles',
        category: 'Environmental Science',
        issueDate: '2024-01-15',
        credentialId: 'ENV-2024-001',
        skills: ['Environmental Awareness', 'Sustainability', 'Climate Science'],
        imageUrl: '/certificates/env-fundamentals.png',
        shareUrl: 'https://platform.com/certificates/ENV-2024-001'
      },
      {
        id: '2',
        title: 'Renewable Energy Specialist',
        description: 'Advanced knowledge in renewable energy technologies and implementation',
        category: 'Energy',
        issueDate: '2024-01-20',
        validUntil: '2026-01-20',
        credentialId: 'REN-2024-002',
        skills: ['Solar Energy', 'Wind Power', 'Energy Efficiency', 'Grid Integration'],
        imageUrl: '/certificates/renewable-energy.png',
        shareUrl: 'https://platform.com/certificates/REN-2024-002'
      }
    ];

    const mockRewards: Reward[] = [
      {
        id: '1',
        title: 'Bonus Points',
        description: 'Extra 100 points for completing weekly challenge',
        type: 'points',
        value: 100,
        claimed: false,
        expiresAt: '2024-01-25',
        requirements: 'Complete 3 challenges this week'
      },
      {
        id: '2',
        title: 'Premium Content Access',
        description: 'Unlock advanced environmental courses',
        type: 'unlock',
        value: 'Premium Courses',
        claimed: true,
        requirements: 'Reach 1000 points'
      },
      {
        id: '3',
        title: 'Eco Store Discount',
        description: '20% off sustainable products',
        type: 'discount',
        value: '20%',
        claimed: false,
        expiresAt: '2024-02-01',
        requirements: 'Complete Sustainable Living track'
      }
    ];

    setTimeout(() => {
      setBadges(mockBadges);
      setCertificates(mockCertificates);
      setRewards(mockRewards);
      setLoading(false);
    }, 1000);
  }, []);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-orange-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300';
      case 'rare': return 'border-blue-300';
      case 'epic': return 'border-purple-300';
      case 'legendary': return 'border-yellow-300';
      default: return 'border-gray-300';
    }
  };

  const filteredBadges = selectedCategory === 'all' 
    ? badges 
    : badges.filter(badge => badge.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'All Badges', icon: SparklesIcon },
    { id: 'learning', name: 'Learning', icon: BookOpenIcon },
    { id: 'achievement', name: 'Achievement', icon: TrophyIcon },
    { id: 'streak', name: 'Streak', icon: FireIcon },
    { id: 'social', name: 'Social', icon: GlobeAltIcon },
    { id: 'special', name: 'Special', icon: StarIcon }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-white to-emerald-50 rounded-lg shadow-lg p-6 border border-emerald-200 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            🏆 Achievements & Rewards ⚡
          </h1>
          <p className="text-gray-600">
            Track your progress, earn badges, and unlock rewards on your environmental learning journey
          </p>
          <div className="mt-4 bg-emerald-100 px-4 py-2 rounded-full inline-block">
            <span className="text-emerald-800 font-bold">
              {badges.filter(b => b.earned).length} of {badges.length} badges earned
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'badges', name: 'Badges', icon: TrophyIcon },
                { id: 'certificates', name: 'Certificates', icon: AcademicCapIcon },
                { id: 'rewards', name: 'Rewards', icon: StarIcon }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-emerald-500 text-emerald-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div>
            {/* Category Filter */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`${
                        selectedCategory === category.id
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                      } px-4 py-2 border rounded-lg text-sm font-medium flex items-center transition-colors`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {category.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBadges.map((badge) => (
                <div
                  key={badge.id}
                  className={`bg-white rounded-xl shadow-sm border-2 ${
                    badge.earned ? getRarityBorder(badge.rarity) : 'border-gray-200'
                  } p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                    badge.earned ? 'ring-2 ring-opacity-20 ring-emerald-500' : 'hover:opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`text-4xl p-3 rounded-lg bg-gradient-to-r ${
                      badge.earned ? getRarityColor(badge.rarity) : 'from-gray-300 to-gray-400'
                    } text-white flex items-center justify-center transition-all duration-300 ${
                      badge.earned ? 'animate-pulse' : ''
                    }`}>
                      {badge.earned ? badge.icon : '🔒'}
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        badge.earned ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {badge.earned ? '✨ Earned' : '🔒 Locked'}
                      </span>
                      <p className="text-sm text-gray-500 mt-1 font-semibold">+{badge.points} pts</p>
                    </div>
                  </div>
                  
                  <h3 className={`text-lg font-bold mb-2 ${
                    badge.earned ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {badge.title}
                    {badge.earned && <span className="ml-2 text-yellow-500">✨</span>}
                  </h3>
                  
                  <p className={`text-sm mb-4 ${
                    badge.earned ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {badge.description}
                  </p>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="text-gray-600">
                        {badge.progress || 0}/{badge.maxProgress || 1}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          badge.earned ? 'bg-emerald-500' : 'bg-gray-400'
                        }`}
                        style={{
                          width: `${((badge.progress || 0) / (badge.maxProgress || 1)) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    {badge.requirements}
                  </p>
                  
                  {badge.earned && badge.earnedAt && (
                    <p className="text-xs text-emerald-600 mt-2 font-semibold">
                      🎉 Earned on {new Date(badge.earnedAt).toLocaleDateString()}
                    </p>
                  )}
                  
                  {!badge.earned && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-300" 
                          style={{width: `${((badge.progress || 0) / (badge.maxProgress || 1)) * 100}%`}}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.round(((badge.progress || 0) / (badge.maxProgress || 1)) * 100)}% progress to unlock
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certificates Tab */}
        {activeTab === 'certificates' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {certificates.map((certificate) => (
              <div key={certificate.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <AcademicCapIcon className="h-8 w-8" />
                    <span className="text-sm opacity-90">Certificate</span>
                  </div>
                  <h3 className="text-xl font-bold mt-4">{certificate.title}</h3>
                  <p className="text-emerald-100 mt-2">{certificate.category}</p>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-600 mb-4">{certificate.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Issue Date</p>
                      <p className="text-sm text-gray-600">
                        {new Date(certificate.issueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Credential ID</p>
                      <p className="text-sm text-gray-600 font-mono">{certificate.credentialId}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Skills Demonstrated</p>
                    <div className="flex flex-wrap gap-2">
                      {certificate.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                      Download PDF
                    </button>
                    <button className="flex-1 border border-emerald-600 text-emerald-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-50 transition-colors">
                      Share
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rewards Tab */}
        {activeTab === 'rewards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => (
              <div key={reward.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${
                    reward.claimed ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    {reward.type === 'points' && <StarIconSolid className="h-6 w-6 text-yellow-600" />}
                    {reward.type === 'badge' && <TrophyIconSolid className="h-6 w-6 text-purple-600" />}
                    {reward.type === 'certificate' && <AcademicCapIcon className="h-6 w-6 text-blue-600" />}
                    {reward.type === 'unlock' && <LockClosedIcon className="h-6 w-6 text-emerald-600" />}
                    {reward.type === 'discount' && <SparklesIcon className="h-6 w-6 text-pink-600" />}
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    reward.claimed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {reward.claimed ? 'Claimed' : 'Available'}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{reward.title}</h3>
                <p className="text-gray-600 mb-4">{reward.description}</p>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-900 mb-1">Value</p>
                  <p className="text-lg font-bold text-emerald-600">{reward.value}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-900 mb-1">Requirements</p>
                  <p className="text-sm text-gray-600">{reward.requirements}</p>
                </div>
                
                {reward.expiresAt && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900 mb-1">Expires</p>
                    <p className="text-sm text-red-600">
                      {new Date(reward.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
                
                <button
                  disabled={reward.claimed}
                  className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    reward.claimed
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {reward.claimed ? 'Already Claimed' : 'Claim Reward'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Achievements;