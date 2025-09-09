import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckIcon,
  StarIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  TrophyIcon,
  UserGroupIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  PlayIcon,
  ArrowRightIcon,
  QuoteIcon
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  cta: string;
  color: string;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
}

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

const Landing: React.FC = () => {
  const features: Feature[] = [
    {
      id: '1',
      title: '🎯 Quest-Based Learning',
      description: 'Complete epic environmental quests with interactive mini-games, videos, and hands-on challenges that level up your eco-skills!',
      icon: AcademicCapIcon,
      color: 'text-blue-600'
    },
    {
      id: '2',
      title: '🌍 Real-World Boss Battles',
      description: 'Take on climate change, pollution, and deforestation in real environmental challenges that make a difference!',
      icon: GlobeAltIcon,
      color: 'text-green-600'
    },
    {
      id: '3',
      title: '🏆 Epic Achievement System',
      description: 'Unlock rare badges, earn XP points, and collect certificates as you become an environmental champion!',
      icon: TrophyIcon,
      color: 'text-yellow-600'
    },
    {
      id: '4',
      title: '👥 Guild & Team Play',
      description: 'Join eco-guilds, team up with players worldwide, and collaborate on planet-saving missions together!',
      icon: UserGroupIcon,
      color: 'text-purple-600'
    },
    {
      id: '5',
      title: '📊 Player Stats & Analytics',
      description: 'Track your eco-impact with detailed stats, progress charts, and personalized recommendations to level up faster!',
      icon: ChartBarIcon,
      color: 'text-indigo-600'
    },
    {
      id: '6',
      title: '🎖️ Skill Mastery Certificates',
      description: 'Earn prestigious certificates and showcase your environmental expertise to the world - completely free!',
      icon: ShieldCheckIcon,
      color: 'text-emerald-600'
    }
  ];

  // Game-focused platform - no pricing needed as it's completely free!

  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Sarah Johnson 🌟',
      role: 'Level 47 Eco-Champion',
      company: '🏆 Climate Action Badge Holder',
      content: 'This game is ADDICTIVE! I\'ve earned 15 badges in 2 months and my real-world environmental knowledge has skyrocketed. The quests make learning feel like an epic adventure! 🚀',
      rating: 5,
      avatar: '👩‍🔬'
    },
    {
      id: '2',
      name: 'Michael Chen ⚡',
      role: 'Level 62 Sustainability Master',
      company: '🎖️ Code Contributor',
      content: 'Being able to contribute code AND learn about the environment? Mind blown! 🤯 The open-source community is amazing, and I\'ve made real friends while saving the planet!',
      rating: 5,
      avatar: '👨‍💼'
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez 🎓',
      role: 'Educator & Guild Leader',
      company: 'Green Classroom Guild',
      content: 'My students BEG to do their environmental homework now! The leaderboards and team challenges have turned my classroom into an eco-gaming arena. Engagement is through the roof! 📈',
      rating: 5,
      avatar: '👩‍🏫'
    },
    {
      id: '4',
      name: 'Alex Thompson 🌱',
      role: 'Level 38 Climate Warrior',
      company: 'Youth Climate Action Guild',
      content: 'Finally, an educational platform that makes environmental learning fun and accessible! The community challenges and open-source nature make this feel like a movement, not just a game! 💚',
      rating: 5,
      avatar: '🌱'
    }
  ];

  const stats = [
    { label: '🎮 Active Players', value: '50,000+' },
    { label: '⚡ XP Points Earned', value: '10M+' },
    { label: '🏆 Badges Unlocked', value: '250,000+' },
    { label: '🌍 Countries Playing', value: '120+' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-50 via-green-50 to-blue-50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              🌍 <span className="text-emerald-600">EcoQuest</span>
              <br />Level Up Your Planet! 🎮
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The world's first <strong>100% FREE</strong> & <strong>Open Source</strong> environmental education game! 
              Earn XP, unlock badges, climb leaderboards, and save the planet while having fun! 🏆🌱
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/register"
                className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-emerald-700 hover:to-green-700 transition-all transform hover:scale-105 flex items-center justify-center shadow-lg"
              >
                🚀 Start Your Eco Adventure!
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/courses"
                className="border-2 border-emerald-600 text-emerald-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-emerald-50 transition-colors flex items-center justify-center"
              >
                <PlayIcon className="mr-2 h-5 w-5" />
                🎬 See the Magic
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              🎮 Game Features That Make Learning Epic!
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Open-source environmental education that feels like your favorite video game! 🚀
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.id} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className={`inline-flex p-3 rounded-lg bg-gray-50 ${feature.color} mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open Source Community Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              🌍 Join the Global Environmental Revolution!
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Completely free, forever! Built by passionate eco-warriors worldwide. Zero barriers, infinite impact - because saving our planet shouldn't cost the Earth! 🚀✨
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-8 border border-emerald-200 hover:shadow-lg transition-shadow">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎮</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">For Eco-Heroes</h3>
                <p className="text-gray-600">Transform into an environmental champion!</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-emerald-600 mr-3" />
                  <span>Epic missions that save real ecosystems</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-emerald-600 mr-3" />
                  <span>Legendary achievements & impact certificates</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-emerald-600 mr-3" />
                  <span>Compete globally for environmental supremacy</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-emerald-600 mr-3" />
                  <span>Unite with 50K+ planet protectors worldwide</span>
                </li>
              </ul>
              <Link
                  to="/register"
                  className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-emerald-700 transition-colors text-center block"
                >
                  🌟 Begin Your Legend!
                </Link>
            </div>

            <div className="bg-gradient-to-br from-emerald-600 to-green-600 text-white rounded-2xl p-8 transform scale-105 shadow-xl">
              <div className="text-center mb-4">
                <span className="bg-white text-emerald-600 px-3 py-1 rounded-full text-sm font-semibold">
                  🌟 Most Popular
                </span>
              </div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👥</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">For World-Builders</h3>
                <p className="text-emerald-100">Shape the future of planetary education!</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-emerald-200 mr-3" />
                  <span>Code the climate solution revolution</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-emerald-200 mr-3" />
                  <span>Craft mind-blowing eco-adventures</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-emerald-200 mr-3" />
                  <span>Innovate game-changing features</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-emerald-200 mr-3" />
                  <span>Earn eternal glory & GitHub stardom</span>
                </li>
              </ul>
              <Link
                  to="/register"
                  className="w-full bg-white text-emerald-600 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center block"
                >
                  ⚡ Join the Revolution
                </Link>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-emerald-200 hover:shadow-lg transition-shadow">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏫</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">For Eco-Mentors</h3>
                <p className="text-gray-600">Ignite the next generation of planet guardians!</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-emerald-600 mr-3" />
                  <span>Command center for eco-classrooms</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-emerald-600 mr-3" />
                  <span>Real-time student impact analytics</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-emerald-600 mr-3" />
                  <span>AI-powered curriculum magic</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-emerald-600 mr-3" />
                  <span>Unlimited teaching superpowers</span>
                </li>
              </ul>
              <Link
                  to="/register"
                  className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-emerald-700 transition-colors text-center block"
                >
                  🌱 Unlock Teaching Powers
                </Link>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-lg text-gray-600 mb-4">
              🔥 <strong>Powered by Passion:</strong> Dive into our open-source universe on GitHub! Every line of code is a step toward planetary healing. Join the movement that's democratizing environmental education across the globe!
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/register"
                className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center"
              >
                <span className="mr-2">🚀</span> Star & Contribute
              </Link>
              <Link
                to="/courses"
                className="border-2 border-emerald-600 text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors flex items-center"
              >
                <span className="mr-2">🧠</span> Explore the Magic
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Player Reviews Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              🎮 What Our Eco-Warriors Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of players leveling up their environmental impact! 🌍⚡
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-gray-50 rounded-xl p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIconSolid key={i} className="h-5 w-5 text-yellow-400" />
                  ))}
                </div>
                
                <blockquote className="text-gray-700 mb-6 text-lg">
                  "{testimonial.content}"
                </blockquote>
                
                <div className="flex items-center">
                  <div className="text-3xl mr-4">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            🌍 Ready to Level Up Your Planet? 🎮
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join 50,000+ eco-warriors in the world's most epic environmental adventure! Completely free, forever! 🚀✨
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-emerald-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-all transform hover:scale-105 flex items-center justify-center shadow-lg"
            >
              🎮 Start Your Eco Quest!
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/courses"
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-emerald-600 transition-colors flex items-center justify-center"
            >
              <PlayIcon className="mr-2 h-5 w-5" />
              🎬 See Epic Gameplay
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="text-emerald-100">
              <div className="text-2xl mb-1">🆓</div>
              <div className="text-sm font-semibold">100% Free</div>
            </div>
            <div className="text-emerald-100">
              <div className="text-2xl mb-1">🔓</div>
              <div className="text-sm font-semibold">Open Source</div>
            </div>
            <div className="text-emerald-100">
              <div className="text-2xl mb-1">🚫</div>
              <div className="text-sm font-semibold">No Ads</div>
            </div>
            <div className="text-emerald-100">
              <div className="text-2xl mb-1">🌍</div>
              <div className="text-sm font-semibold">Global Community</div>
            </div>
          </div>
          <p className="text-emerald-200 mt-6 text-sm">
            💡 No registration required to explore • 🎮 Start playing instantly • 🌱 Make real environmental impact
          </p>
        </div>
      </section>
    </div>
  );
};

export default Landing;