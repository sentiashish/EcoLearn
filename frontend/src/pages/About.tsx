import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HeartIcon,
  GlobeAltIcon,
  LightBulbIcon,
  UserGroupIcon,
  TrophyIcon,
  SparklesIcon,
  RocketLaunchIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const teamMembers = [
  {
    name: 'Dr. Sarah Green',
    role: 'Founder & Chief Environmental Officer',
    bio: 'Environmental scientist with 15+ years of experience in climate research.',
    avatar: '🌱',
    achievements: ['Climate Research Pioneer', 'Sustainability Expert', 'Green Innovation Leader']
  },
  {
    name: 'Prof. Mike Earth',
    role: 'Head of Education',
    bio: 'Former university professor specializing in environmental education.',
    avatar: '🎓',
    achievements: ['Education Innovator', 'Curriculum Designer', 'Learning Expert']
  },
  {
    name: 'Dr. Ocean Blue',
    role: 'Marine Conservation Lead',
    bio: 'Marine biologist dedicated to ocean ecosystem preservation.',
    avatar: '🌊',
    achievements: ['Ocean Guardian', 'Marine Expert', 'Conservation Champion']
  },
  {
    name: 'Ranger Forest',
    role: 'Forestry & Biodiversity Expert',
    bio: 'Forest ranger turned educator with deep knowledge of ecosystems.',
    avatar: '🌳',
    achievements: ['Forest Guardian', 'Biodiversity Expert', 'Nature Protector']
  }
];

const stats = [
  { label: 'Active Learners', value: '50,000+', icon: '👥' },
  { label: 'Courses Completed', value: '125,000+', icon: '📚' },
  { label: 'CO₂ Reduced', value: '2.5M tons', icon: '🌍' },
  { label: 'Trees Planted', value: '1M+', icon: '🌳' },
  { label: 'Countries Reached', value: '150+', icon: '🗺️' },
  { label: 'Achievements Unlocked', value: '500K+', icon: '🏆' }
];

const values = [
  {
    icon: <GlobeAltIcon className="h-8 w-8" />,
    title: 'Global Impact',
    description: 'Creating worldwide environmental awareness through accessible education.'
  },
  {
    icon: <LightBulbIcon className="h-8 w-8" />,
    title: 'Innovation',
    description: 'Using cutting-edge gamification to make learning engaging and effective.'
  },
  {
    icon: <UserGroupIcon className="h-8 w-8" />,
    title: 'Community',
    description: 'Building a supportive network of environmental champions worldwide.'
  },
  {
    icon: <HeartIcon className="h-8 w-8" />,
    title: 'Passion',
    description: 'Driven by genuine care for our planet and future generations.'
  }
];

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              🌍 About EcoQuest
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Transforming environmental education through gamified learning experiences that inspire real-world action! 🚀
            </p>
            <div className="flex justify-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                <p className="text-lg font-medium">
                  "Making environmental education as engaging as your favorite game" 🎮
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              🎯 Our Mission
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              We believe that saving our planet shouldn't be boring! EcoQuest combines the excitement of gaming 
              with the urgency of environmental action. Through interactive courses, achievement systems, and 
              community challenges, we're creating the next generation of environmental champions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
              >
                <div className="text-emerald-600 mb-4 flex justify-center group-hover:scale-110 transition-transform">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              📊 Our Impact
            </h2>
            <p className="text-xl text-gray-600">
              Together, we're making a real difference for our planet! 🌱
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300"
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-2xl font-bold text-emerald-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              👥 Meet Our Team
            </h2>
            <p className="text-xl text-gray-600">
              Environmental experts and education innovators working together! 🤝
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                  {member.avatar}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-emerald-600 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm mb-4">
                  {member.bio}
                </p>
                <div className="space-y-1">
                  {member.achievements.map((achievement, idx) => (
                    <span
                      key={idx}
                      className="inline-block px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full mr-1 mb-1"
                    >
                      🏆 {achievement}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold mb-8">
              📖 Our Story
            </h2>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-left">
              <p className="text-lg leading-relaxed mb-6">
                🌱 <strong>It all started with a simple question:</strong> "Why is environmental education so boring when our planet's future is at stake?"
              </p>
              <p className="text-lg leading-relaxed mb-6">
                🎮 <strong>The answer led us to gamification.</strong> We discovered that when learning feels like playing, people engage more deeply and retain knowledge longer. So we set out to create the world's most engaging environmental education platform.
              </p>
              <p className="text-lg leading-relaxed mb-6">
                🚀 <strong>Today, EcoQuest is more than just a platform</strong> – it's a global movement. We've helped thousands of learners transform from environmental novices to passionate advocates, all while having fun along the way.
              </p>
              <p className="text-lg leading-relaxed">
                🌍 <strong>Our vision is simple:</strong> A world where every person has the knowledge, skills, and motivation to be an environmental champion. Join us on this quest to save our planet, one learner at a time!
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              🚀 Ready to Join Our Mission?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Become part of the EcoQuest community and start your environmental journey today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                <RocketLaunchIcon className="h-6 w-6" />
                Start Your Quest
              </Link>
              <Link
                to="/courses"
                className="border-2 border-emerald-600 text-emerald-600 px-8 py-4 rounded-xl font-bold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
              >
                <AcademicCapIcon className="h-6 w-6" />
                Explore Courses
              </Link>
              <Link
                to="/contact"
                className="bg-gray-100 text-gray-700 px-8 py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <UserGroupIcon className="h-6 w-6" />
                Get in Touch
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;