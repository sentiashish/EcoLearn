import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PosterGrid from '@/components/PosterGrid';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Content, Challenge, UserProgress } from '@/types';
import { useContent, useChallenges, useUser } from '@/hooks/useApi';
import { 
  BookOpenIcon, 
  TrophyIcon, 
  FireIcon, 
  GlobeAltIcon, 
  SparklesIcon,
  AcademicCapIcon,
  ChartBarIcon,
  UserGroupIcon,
  PlayIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  BoltIcon,
  StarIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { 
  GlobeAltIcon as GlobeAltIconSolid,
  SparklesIcon as SparklesIconSolid,
  TrophyIcon as TrophyIconSolid,
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid
} from '@heroicons/react/24/solid';

// Floating particles component
const FloatingParticles: React.FC = () => {
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, speed: number}>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 2 + 1
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-green-400/20 animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animation: `float ${particle.speed + 3}s ease-in-out infinite alternate`
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
};

// Animated counter component
const AnimatedCounter: React.FC<{ end: number; duration?: number; suffix?: string }> = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

// XP Progress Bar component
const XPProgressBar: React.FC<{ current: number; max: number; level: number }> = ({ current, max, level }) => {
  const percentage = (current / max) * 100;
  
  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">Level {level}</span>
        <span className="text-sm text-gray-500">{current}/{max} XP</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-1000 ease-out relative"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'content' | 'challenges'>('content');
  const [impactStats, setImpactStats] = useState({ co2Saved: 0, treesPlanted: 0, studentsImpacted: 0 });

  // Use React Query hooks
  const { data: contentData, isLoading: contentLoading } = useContent({ page: 1 });
  const { data: challengesData, isLoading: challengesLoading } = useChallenges({ page: 1 });
  const { data: userProfile, isLoading: profileLoading } = useUser();

  const loading = contentLoading || challengesLoading || profileLoading;
  const content = contentData?.results || [];
  const challenges = challengesData?.results || [];
  const userProgress = userProfile;

  // Simulate real-time impact stats
  useEffect(() => {
    const interval = setInterval(() => {
      setImpactStats(prev => ({
        co2Saved: prev.co2Saved + Math.floor(Math.random() * 5),
        treesPlanted: prev.treesPlanted + Math.floor(Math.random() * 2),
        studentsImpacted: prev.studentsImpacted + Math.floor(Math.random() * 3)
      }));
    }, 3000);
    
    // Initial values
    setImpactStats({ co2Saved: 12847, treesPlanted: 3421, studentsImpacted: 8965 });
    
    return () => clearInterval(interval);
  }, []);

  // Data is used directly from API responses

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Enhanced Hero Section with Animations */}
      <div className="relative overflow-hidden min-h-screen flex items-center">
        <FloatingParticles />
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-blue-600/10"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-green-200/30 rounded-full animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-blue-200/30 rounded-full animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
          <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-emerald-200/30 rounded-full animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 z-10">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full animate-pulse hover:animate-none transition-all duration-300 hover:scale-105">
                <GlobeAltIconSolid className="h-5 w-5 text-green-600 animate-spin" style={{animationDuration: '3s'}} />
                <span className="text-green-800 font-medium text-sm">🌱 Leading Environmental Education Platform</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
              Master <span className="text-green-600 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent animate-pulse">Environmental Science</span>
              <br />Through <span className="relative">
                Interactive Learning
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-full animate-pulse"></div>
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-fade-in" style={{animationDelay: '0.5s'}}>
              🎮 Join thousands of students mastering climate science, sustainability, and eco-friendly practices through 
              gamified challenges, expert-led courses, and real-world projects.
            </p>
            
            {/* Real-time Impact Counter */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 max-w-4xl mx-auto shadow-lg animate-fade-in" style={{animationDelay: '1s'}}>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🌍 Real-Time Environmental Impact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    <AnimatedCounter end={impactStats.co2Saved} suffix=" kg" />
                  </div>
                  <p className="text-sm text-gray-600">CO₂ Saved by Our Community</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    <AnimatedCounter end={impactStats.treesPlanted} />
                  </div>
                  <p className="text-sm text-gray-600">🌳 Virtual Trees Planted</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    <AnimatedCounter end={impactStats.studentsImpacted} />
                  </div>
                  <p className="text-sm text-gray-600">👥 Students Educated</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{animationDelay: '1.5s'}}>
              <Link
                to="/challenges"
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <PlayIcon className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                🚀 Start Learning Now
                <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link
                to="/content"
                className="group inline-flex items-center px-8 py-4 bg-white/90 backdrop-blur-sm text-green-600 font-semibold rounded-lg hover:bg-white transition-all duration-300 border-2 border-green-600 hover:border-green-700 transform hover:scale-105 shadow-lg"
              >
                📚 Explore Courses
                <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>

      {/* Enhanced Welcome Back Section for Logged In Users */}
      {user && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl p-8 mb-12 border border-green-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  Welcome back, {user.first_name}! 
                  <span className="animate-wave inline-block">👋</span>
                </h2>
                <p className="text-gray-600 mt-2">
                  🌱 Continue your environmental learning journey and make an impact.
                </p>
                {userProgress && (
                  <div className="mt-4">
                    <XPProgressBar 
                      current={userProgress.points || 0} 
                      max={((userProgress.level || 1) * 1000)} 
                      level={userProgress.level || 1} 
                    />
                  </div>
                )}
              </div>
              <div className="hidden md:block">
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full animate-pulse">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    <span className="text-green-800 font-medium">🏆 Active Learner</span>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(Math.min(userProgress?.level || 1, 5))].map((_, i) => (
                      <StarIconSolid key={i} className="h-4 w-4 text-yellow-400 animate-pulse" style={{animationDelay: `${i * 0.2}s`}} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Gamified Progress Stats */}
            {userProgress && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="group bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-700 flex items-center gap-1">
                        💰 Eco-Points
                      </p>
                      <p className="text-3xl font-bold text-yellow-900 group-hover:animate-pulse">
                        <AnimatedCounter end={userProgress.points || 0} />
                      </p>
                      <div className="text-xs text-yellow-600 mt-1">
                        +{Math.floor((userProgress.points || 0) * 0.1)} this week
                      </div>
                    </div>
                    <div className="relative">
                      <TrophyIconSolid className="h-10 w-10 text-yellow-500 group-hover:animate-bounce" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                    </div>
                  </div>
                </div>

                <div className="group bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-700 flex items-center gap-1">
                        🔥 Current Level
                      </p>
                      <p className="text-3xl font-bold text-orange-900 group-hover:animate-pulse">
                        {userProgress.level || 1}
                      </p>
                      <div className="text-xs text-orange-600 mt-1">
                        {Math.floor(((userProgress.points || 0) / ((userProgress.level || 1) * 1000)) * 100)}% to next level
                      </div>
                    </div>
                    <div className="relative">
                      <FireIcon className="h-10 w-10 text-orange-500 group-hover:animate-pulse" />
                      <div className="absolute inset-0 bg-orange-400/20 rounded-full animate-ping"></div>
                    </div>
                  </div>
                </div>

                <div className="group bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700 flex items-center gap-1">
                        🌍 Challenges
                      </p>
                      <p className="text-3xl font-bold text-green-900 group-hover:animate-pulse">
                        {userProgress.challenges_solved || 0}
                      </p>
                      <div className="text-xs text-green-600 mt-1">
                        {Math.floor((userProgress.challenges_solved || 0) * 0.2)} this month
                      </div>
                    </div>
                    <div className="relative">
                      <GlobeAltIconSolid className="h-10 w-10 text-green-500 group-hover:animate-spin" style={{animationDuration: '2s'}} />
                      <HeartIconSolid className="absolute -bottom-1 -right-1 h-4 w-4 text-red-500 animate-pulse" />
                    </div>
                  </div>
                </div>

                <div className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700 flex items-center gap-1">
                        📚 Lessons
                      </p>
                      <p className="text-3xl font-bold text-blue-900 group-hover:animate-pulse">
                        {userProgress.content_completed || 0}
                      </p>
                      <div className="text-xs text-blue-600 mt-1">
                        {Math.floor((userProgress.content_completed || 0) * 0.15)} completed today
                      </div>
                    </div>
                    <div className="relative">
                      <AcademicCapIcon className="h-10 w-10 text-blue-500 group-hover:animate-bounce" />
                      <BoltIcon className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Daily Challenge Widget */}
            <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    🎯 Daily Eco-Challenge
                    <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">NEW</span>
                  </h3>
                  <p className="text-sm text-gray-600">Complete today's challenge to earn bonus XP!</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">🔥 7</div>
                  <div className="text-xs text-purple-500">Day Streak</div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 mb-2">💡 <strong>Today's Challenge:</strong> Calculate your carbon footprint and find 3 ways to reduce it!</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full" style={{width: '60%'}}></div>
                  </div>
                  <span className="text-xs text-gray-500">60% Complete</span>
                </div>
              </div>
              <Link
                to="/challenges"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
              >
                Continue Challenge
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-20deg); }
        }
        .animate-wave {
          animation: wave 2s ease-in-out infinite;
        }
      `}</style>

      {/* Enhanced Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 animate-fade-in">
            🌟 Why Choose EcoLearn?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in" style={{animationDelay: '0.3s'}}>
            Our comprehensive platform combines cutting-edge technology with expert environmental science curriculum.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="group bg-gradient-to-br from-white to-green-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-green-100 cursor-pointer animate-fade-in" style={{animationDelay: '0.5s'}}>
            <div className="bg-gradient-to-br from-green-100 to-green-200 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:animate-bounce transition-all duration-300">
              <AcademicCapIcon className="h-8 w-8 text-green-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-green-700 transition-colors duration-300">🎓 Expert-Led Courses</h3>
            <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
              Learn from leading environmental scientists and sustainability experts through structured, interactive courses.
            </p>
            <div className="mt-4 flex items-center text-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-sm font-medium">Explore Courses</span>
              <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
          
          <div className="group bg-gradient-to-br from-white to-blue-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-blue-100 cursor-pointer animate-fade-in" style={{animationDelay: '0.7s'}}>
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:animate-pulse transition-all duration-300">
              <ChartBarIcon className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors duration-300">📊 Gamified Progress</h3>
            <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
              Monitor your learning journey with XP points, level progression, achievements, and personalized recommendations.
            </p>
            <div className="mt-4 flex items-center text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-sm font-medium">View Progress</span>
              <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
          
          <div className="group bg-gradient-to-br from-white to-purple-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-purple-100 cursor-pointer animate-fade-in" style={{animationDelay: '0.9s'}}>
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:animate-spin transition-all duration-300" style={{animationDuration: '2s'}}>
              <UserGroupIcon className="h-8 w-8 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-purple-700 transition-colors duration-300">👥 Community Learning</h3>
            <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
              Connect with like-minded learners, participate in challenges, and collaborate on environmental projects.
            </p>
            <div className="mt-4 flex items-center text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-sm font-medium">Join Community</span>
              <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </div>
        
        {/* Interactive Learning Path Visualization */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 mb-16 border border-green-200">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">🗺️ Your Learning Journey</h3>
            <p className="text-gray-600">Follow the interactive path to environmental mastery</p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {[
              { icon: '🌱', title: 'Beginner', desc: 'Start your journey', color: 'green', completed: true },
              { icon: '🌿', title: 'Intermediate', desc: 'Build knowledge', color: 'blue', completed: true },
              { icon: '🌳', title: 'Advanced', desc: 'Master concepts', color: 'purple', completed: false },
              { icon: '🏆', title: 'Expert', desc: 'Lead others', color: 'yellow', completed: false }
            ].map((step, index) => (
              <div key={index} className="flex flex-col items-center group cursor-pointer">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-2 transition-all duration-300 group-hover:scale-110 ${
                  step.completed 
                    ? 'bg-gradient-to-br from-green-400 to-green-500 shadow-lg' 
                    : 'bg-gray-200 group-hover:bg-gray-300'
                }`}>
                  {step.icon}
                </div>
                <h4 className={`font-semibold text-sm mb-1 transition-colors duration-300 ${
                  step.completed ? 'text-green-700' : 'text-gray-500 group-hover:text-gray-700'
                }`}>
                  {step.title}
                </h4>
                <p className="text-xs text-gray-500 text-center">{step.desc}</p>
                {index < 3 && (
                  <div className={`hidden md:block w-16 h-1 mt-4 rounded-full transition-all duration-300 ${
                    step.completed ? 'bg-green-400' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Gamified Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">🎮 Choose Your Adventure</h2>
            <p className="text-xl text-gray-600">Explore courses or take on exciting challenges</p>
          </div>
          
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-r from-green-100 to-blue-100 p-2 rounded-2xl shadow-lg border border-green-200">
              <button
                onClick={() => setActiveTab('content')}
                className={`group relative px-8 py-4 rounded-xl font-bold transition-all duration-300 flex items-center gap-3 ${
                  activeTab === 'content'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:text-green-600 hover:bg-white/50'
                }`}
              >
                <span className="text-2xl">📚</span>
                <span>Environmental Courses</span>
                {activeTab === 'content' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
                )}
                <div className={`absolute bottom-0 left-0 h-1 bg-green-400 rounded-full transition-all duration-300 ${
                  activeTab === 'content' ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </button>
              <button
                onClick={() => setActiveTab('challenges')}
                className={`group relative px-8 py-4 rounded-xl font-bold transition-all duration-300 flex items-center gap-3 ${
                  activeTab === 'challenges'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-white/50'
                }`}
              >
                <span className="text-2xl">🏆</span>
                <span>Eco-Challenges</span>
                {activeTab === 'challenges' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
                )}
                <div className={`absolute bottom-0 left-0 h-1 bg-blue-400 rounded-full transition-all duration-300 ${
                  activeTab === 'challenges' ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </button>
            </div>
          </div>
          
          {/* Tab Content Stats */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
              <div className="flex items-center gap-6 text-sm">
                {activeTab === 'content' ? (
                  <>
                    <div className="flex items-center gap-2 text-green-600">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="font-medium">{content?.length || 0} Courses Available</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600">
                      <span>⭐</span>
                      <span>4.8 Average Rating</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-600">
                      <span>👥</span>
                      <span>12,450+ Students</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-blue-600">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                      <span className="font-medium">{challenges?.length || 0} Active Challenges</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <span>🎯</span>
                      <span>Weekly Rewards</span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-600">
                      <span>🔥</span>
                      <span>Join 8,200+ Participants</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Content Grid */}
          <div className="transition-all duration-500 transform">
            {activeTab === 'content' ? (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      📚 Featured Environmental Courses
                      {content.length > 0 && (
                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          {content.length} Available
                        </div>
                      )}
                    </h3>
                    <p className="text-gray-600 mt-2">Master sustainability through expert-designed curriculum</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {content.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-orange-600">
                        <span>🔥</span>
                        <span>Trending Now</span>
                      </div>
                    )}
                    <Link
                      to="/content"
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      View All Courses
                      <ArrowRightIcon className="h-4 w-4 ml-2" />
                    </Link>
                  </div>
                </div>
                {content.length > 0 ? (
                  <div className="animate-fade-in">
                    <PosterGrid items={content} type="content" />
                  </div>
                ) : (
                  <div className="text-center py-16 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl animate-fade-in">
                    <div className="relative">
                      <SparklesIconSolid className="mx-auto h-20 w-20 text-green-500 mb-6 animate-bounce" />
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                        <span className="text-sm">🚀</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">🌱 Environmental Courses Coming Soon!</h3>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                      We're crafting amazing interactive courses on climate science, renewable energy, sustainable agriculture, and more. 
                      Get ready for an immersive learning experience!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <Link
                        to="/challenges"
                        className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        <span>🎓</span>
                        <span className="ml-2">Try Eco-Challenges Instead</span>
                        <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>📅</span>
                        <span>New courses every week</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      🏆 Interactive Eco-Challenges
                      {challenges.length > 0 && (
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {challenges.length} Live
                        </div>
                      )}
                    </h3>
                    <p className="text-gray-600 mt-2">Apply your knowledge through real-world environmental scenarios</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {challenges.length > 0 && (
                      <>
                        <div className="flex items-center gap-2 text-sm text-orange-600">
                          <span>⏰</span>
                          <span>Ends in 3 days</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <span>💰</span>
                          <span>Win Eco-Points</span>
                        </div>
                      </>
                    )}
                    <Link
                      to="/challenges"
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      View All Challenges
                      <ArrowRightIcon className="h-4 w-4 ml-2" />
                    </Link>
                  </div>
                </div>
                {challenges.length > 0 ? (
                  <div className="animate-fade-in">
                    <PosterGrid items={challenges} type="challenges" />
                  </div>
                ) : (
                  <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-purple-100 rounded-xl animate-fade-in">
                    <div className="relative">
                      <GlobeAltIconSolid className="mx-auto h-20 w-20 text-blue-500 mb-6 animate-pulse" />
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                        <span className="text-sm">⚡</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">🎯 Epic Eco-Challenges Loading!</h3>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                      Join exciting environmental challenges, compete with eco-warriors worldwide, and earn amazing rewards 
                      while making a positive impact on our planet!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <Link
                        to="/content"
                        className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        <span>🚀</span>
                        <span className="ml-2">Explore Courses Instead</span>
                        <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>🎁</span>
                        <span>Weekly prizes & rewards</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Call to Action Section */}
      <div className="relative bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 py-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-float" />
          <div className="absolute top-32 right-20 w-16 h-16 bg-yellow-400/20 rounded-full animate-float" style={{animationDelay: '1s'}} />
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-green-400/20 rounded-full animate-float" style={{animationDelay: '2s'}} />
          <div className="absolute bottom-32 right-1/3 w-24 h-24 bg-blue-400/10 rounded-full animate-float" style={{animationDelay: '0.5s'}} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in">
              🌍 Ready to Save the Planet?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto animate-fade-in" style={{animationDelay: '0.3s'}}>
              Join <span className="font-bold text-yellow-300">25,000+</span> eco-warriors who are already making a positive impact through 
              gamified learning and real-world action!
            </p>
            
            {/* Impact Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 animate-fade-in" style={{animationDelay: '0.6s'}}>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white mb-1">
                  <AnimatedCounter end={impactStats.treesPlanted} duration={2000} />+
                </div>
                <div className="text-green-200 text-sm">🌳 Trees Planted</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white mb-1">
                  <AnimatedCounter end={impactStats.co2Saved} duration={2000} />kg
                </div>
                <div className="text-blue-200 text-sm">💨 CO₂ Saved</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white mb-1">
                  <AnimatedCounter end={impactStats.studentsImpacted} duration={2000} />+
                </div>
                <div className="text-purple-200 text-sm">👥 Students Educated</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white mb-1">
                  <AnimatedCounter end={2500} duration={2000} />kWh
                </div>
                <div className="text-yellow-200 text-sm">⚡ Energy Saved</div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="group inline-flex items-center px-10 py-5 border border-transparent text-xl font-bold rounded-2xl text-green-600 bg-white hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl"
              >
                <span className="text-2xl mr-3">🚀</span>
                Start Your Eco-Journey
                <ArrowRightIcon className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <Link
                to="/leaderboard"
                className="group inline-flex items-center px-10 py-5 border-2 border-white text-xl font-bold rounded-2xl text-white hover:bg-white hover:text-green-600 transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                <span className="text-2xl mr-3">🏆</span>
                View Leaderboard
                <ArrowRightIcon className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
            
            {/* Mini Leaderboard Preview */}
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20 min-w-[300px]">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>🏆</span>
                Top Eco-Warriors This Week
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'EcoMaster2024', points: 2450, badge: '🥇' },
                  { name: 'GreenGuardian', points: 2380, badge: '🥈' },
                  { name: 'ClimateChamp', points: 2290, badge: '🥉' }
                ].map((player, index) => (
                  <div key={index} className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{player.badge}</span>
                      <span className="text-white font-medium">{player.name}</span>
                    </div>
                    <div className="text-yellow-300 font-bold">{player.points} XP</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Link
                  to="/leaderboard"
                  className="text-yellow-300 hover:text-yellow-200 text-sm font-medium transition-colors"
                >
                  View Full Rankings →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Quick Actions for Logged In Users */}
      {user && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🎮 Your Eco-Dashboard
            </h2>
            <p className="text-lg text-gray-600">
              Welcome back, <span className="font-bold text-green-600">{user.first_name || 'Eco-Warrior'}</span>! Ready to continue your environmental journey?
            </p>
          </div>
          
          {/* Achievement Badges Preview */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 mb-8 border border-yellow-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>🏅</span>
                Recent Achievements
              </h3>
              <Link
                to="/achievements"
                className="text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors"
              >
                View All →
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {[
                { icon: '🌱', name: 'First Steps', desc: 'Completed first lesson', earned: true },
                { icon: '🔥', name: 'Week Streak', desc: '7 days learning', earned: true },
                { icon: '🌍', name: 'Global Impact', desc: 'Joined 5 challenges', earned: true },
                { icon: '🎯', name: 'Challenge Master', desc: 'Complete 10 challenges', earned: false },
                { icon: '👑', name: 'Eco-Expert', desc: 'Reach level 10', earned: false }
              ].map((badge, index) => (
                <div
                  key={index}
                  className={`flex-shrink-0 w-24 h-24 rounded-xl flex flex-col items-center justify-center text-center p-2 transition-all duration-300 hover:scale-105 ${
                    badge.earned
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <span className="text-2xl mb-1">{badge.icon}</span>
                  <span className="text-xs font-medium">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Continue Your Journey</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                to="/leaderboard"
                className="group bg-gradient-to-br from-yellow-50 to-orange-50 p-8 rounded-2xl border border-yellow-200 hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-400/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="bg-yellow-100 p-3 rounded-xl group-hover:animate-bounce">
                      <TrophyIconSolid className="h-8 w-8 text-yellow-600" />
                    </div>
                    <ArrowRightIcon className="h-6 w-6 text-gray-400 group-hover:text-yellow-600 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-yellow-700 transition-colors">🏆 Eco-Champions</h4>
                  <p className="text-gray-600 text-sm mb-4 group-hover:text-gray-700 transition-colors">
                    See how you rank among environmental leaders worldwide
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full font-medium">
                      Rank #42
                    </span>
                    <span className="text-green-600 font-medium">↗ +5 this week</span>
                  </div>
                </div>
              </Link>
              
              <Link
                to="/profile"
                className="group bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200 hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="bg-blue-100 p-3 rounded-xl group-hover:animate-pulse">
                      <ChartBarIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <ArrowRightIcon className="h-6 w-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">👤 My Progress</h4>
                  <p className="text-gray-600 text-sm mb-4 group-hover:text-gray-700 transition-colors">
                    Track your learning journey and achievements
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full font-medium">
                      85% Complete
                    </span>
                    <span className="text-orange-600 font-medium">Update profile</span>
                  </div>
                </div>
              </Link>
              
              <Link
                to="/achievements"
                className="group bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-200 hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-400/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="bg-purple-100 p-3 rounded-xl group-hover:animate-spin" style={{animationDuration: '2s'}}>
                      <FireIcon className="h-8 w-8 text-purple-600" />
                    </div>
                    <ArrowRightIcon className="h-6 w-6 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-700 transition-colors">⭐ Achievements</h4>
                  <p className="text-gray-600 text-sm mb-4 group-hover:text-gray-700 transition-colors">
                    View your badges and certifications
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="bg-purple-200 text-purple-800 px-2 py-1 rounded-full font-medium">
                      12/25 Badges
                    </span>
                    <span className="text-green-600 font-medium">🎁 3 new rewards</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;