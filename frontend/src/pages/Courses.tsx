import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AcademicCapIcon,
  ClockIcon,
  StarIcon,
  PlayIcon,
  BookOpenIcon,
  UserGroupIcon,
  TrophyIcon,
  FireIcon
} from '@heroicons/react/24/outline';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  students: number;
  image: string;
  category: string;
  price: number;
  lessons: number;
  achievements: string[];
}

const courses: Course[] = [
  {
    id: '1',
    title: '🌱 Climate Change Fundamentals',
    description: 'Master the basics of climate science and environmental impact assessment.',
    instructor: 'Dr. Sarah Green',
    duration: '6 weeks',
    level: 'Beginner',
    rating: 4.8,
    students: 1250,
    image: '/api/placeholder/400/250',
    category: 'Climate Science',
    price: 0,
    lessons: 24,
    achievements: ['Climate Warrior', 'Eco Beginner', 'Green Thinker']
  },
  {
    id: '2',
    title: '♻️ Sustainable Living Mastery',
    description: 'Transform your lifestyle with practical sustainability strategies.',
    instructor: 'Prof. Mike Earth',
    duration: '8 weeks',
    level: 'Intermediate',
    rating: 4.9,
    students: 890,
    image: '/api/placeholder/400/250',
    category: 'Lifestyle',
    price: 49,
    lessons: 32,
    achievements: ['Sustainability Expert', 'Eco Lifestyle', 'Green Living']
  },
  {
    id: '3',
    title: '🌊 Ocean Conservation Quest',
    description: 'Dive deep into marine ecosystem protection and restoration.',
    instructor: 'Dr. Ocean Blue',
    duration: '10 weeks',
    level: 'Advanced',
    rating: 4.7,
    students: 567,
    image: '/api/placeholder/400/250',
    category: 'Conservation',
    price: 79,
    lessons: 40,
    achievements: ['Ocean Guardian', 'Marine Expert', 'Blue Planet Hero']
  },
  {
    id: '4',
    title: '🌳 Forest Restoration Academy',
    description: 'Learn reforestation techniques and biodiversity conservation.',
    instructor: 'Ranger Forest',
    duration: '12 weeks',
    level: 'Advanced',
    rating: 4.6,
    students: 423,
    image: '/api/placeholder/400/250',
    category: 'Forestry',
    price: 99,
    lessons: 48,
    achievements: ['Forest Guardian', 'Tree Planter', 'Biodiversity Champion']
  },
  {
    id: '5',
    title: '⚡ Renewable Energy Basics',
    description: 'Explore solar, wind, and other clean energy technologies.',
    instructor: 'Dr. Power Green',
    duration: '4 weeks',
    level: 'Beginner',
    rating: 4.5,
    students: 1100,
    image: '/api/placeholder/400/250',
    category: 'Energy',
    price: 0,
    lessons: 16,
    achievements: ['Energy Explorer', 'Solar Specialist', 'Wind Warrior']
  },
  {
    id: '6',
    title: '🌍 Global Environmental Policy',
    description: 'Understand international environmental agreements and policies.',
    instructor: 'Prof. Policy Maker',
    duration: '14 weeks',
    level: 'Advanced',
    rating: 4.4,
    students: 234,
    image: '/api/placeholder/400/250',
    category: 'Policy',
    price: 129,
    lessons: 56,
    achievements: ['Policy Expert', 'Global Thinker', 'Environmental Advocate']
  }
];

const categories = ['All', 'Climate Science', 'Lifestyle', 'Conservation', 'Forestry', 'Energy', 'Policy'];
const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const Courses: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesLevel && matchesSearch;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              🎓 EcoQuest Academy
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Master environmental science through gamified learning experiences! 🌍
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-lg">
              <div className="flex items-center gap-2">
                <BookOpenIcon className="h-6 w-6" />
                <span>{courses.length} Courses</span>
              </div>
              <div className="flex items-center gap-2">
                <UserGroupIcon className="h-6 w-6" />
                <span>{courses.reduce((sum, course) => sum + course.students, 0).toLocaleString()} Students</span>
              </div>
              <div className="flex items-center gap-2">
                <TrophyIcon className="h-6 w-6" />
                <span>Unlock Achievements</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="🔍 Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Level Filter */}
            <div className="flex flex-wrap gap-2">
              {levels.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-4 py-2 rounded-full font-medium transition-colors ${
                    selectedLevel === level
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Course Image */}
                <div className="relative h-48 bg-gradient-to-br from-emerald-400 to-teal-500">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl">
                      {course.title.split(' ')[0]}
                    </div>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(course.level)}`}>
                      {course.level}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    {course.price === 0 ? (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        FREE
                      </span>
                    ) : (
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        ${course.price}
                      </span>
                    )}
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Course Stats */}
                  <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{course.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <UserGroupIcon className="h-4 w-4" />
                      <span>{course.students.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>
                  </div>

                  {/* Instructor */}
                  <div className="flex items-center gap-2 mb-4">
                    <AcademicCapIcon className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm text-gray-700">{course.instructor}</span>
                  </div>

                  {/* Achievements Preview */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrophyIcon className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-700">Unlock Achievements:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {course.achievements.slice(0, 2).map((achievement, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                        >
                          🏆 {achievement}
                        </span>
                      ))}
                      {course.achievements.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{course.achievements.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Link
                      to={`/lesson/${course.id}`}
                      className="flex-1 bg-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-emerald-700 transition-colors text-center flex items-center justify-center gap-2"
                    >
                      <PlayIcon className="h-5 w-5" />
                      Start Quest
                    </Link>
                    <button className="px-4 py-3 border-2 border-emerald-600 text-emerald-600 rounded-xl hover:bg-emerald-50 transition-colors">
                      <BookOpenIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              🚀 Ready to Start Your Eco Journey?
            </h2>
            <p className="text-xl mb-8">
              Join thousands of environmental champions and unlock your potential!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                <FireIcon className="h-6 w-6" />
                Join EcoQuest Now
              </Link>
              <Link
                to="/contact"
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-emerald-600 transition-colors flex items-center justify-center gap-2"
              >
                <UserGroupIcon className="h-6 w-6" />
                Get Support
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Courses;