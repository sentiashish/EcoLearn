import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AcademicCapIcon,
  ClockIcon,
  StarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  PlayIcon,
  BookOpenIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

interface LearningPath {
  id: number;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  modules: number;
  enrolled: number;
  rating: number;
  progress?: number;
  category: string;
  skills: string[];
  instructor: string;
  image: string;
}

const learningPaths: LearningPath[] = [
  {
    id: 1,
    title: "Climate Change Warrior",
    description: "Master the fundamentals of climate science and become an advocate for environmental change.",
    difficulty: "Beginner",
    duration: "6 weeks",
    modules: 8,
    enrolled: 1250,
    rating: 4.8,
    progress: 65,
    category: "Climate Science",
    skills: ["Climate Analysis", "Carbon Footprint", "Renewable Energy"],
    instructor: "Dr. Sarah Green",
    image: "🌍"
  },
  {
    id: 2,
    title: "Sustainable Living Expert",
    description: "Learn practical strategies for sustainable living and reduce your environmental impact.",
    difficulty: "Intermediate",
    duration: "8 weeks",
    modules: 12,
    enrolled: 890,
    rating: 4.9,
    progress: 30,
    category: "Sustainability",
    skills: ["Waste Reduction", "Energy Efficiency", "Sustainable Design"],
    instructor: "Prof. Michael Earth",
    image: "♻️"
  },
  {
    id: 3,
    title: "Renewable Energy Specialist",
    description: "Deep dive into renewable energy technologies and their implementation.",
    difficulty: "Advanced",
    duration: "10 weeks",
    modules: 15,
    enrolled: 567,
    rating: 4.7,
    category: "Energy",
    skills: ["Solar Power", "Wind Energy", "Energy Storage"],
    instructor: "Dr. Alex Solar",
    image: "⚡"
  },
  {
    id: 4,
    title: "Biodiversity Guardian",
    description: "Explore ecosystems, wildlife conservation, and biodiversity protection strategies.",
    difficulty: "Intermediate",
    duration: "7 weeks",
    modules: 10,
    enrolled: 723,
    rating: 4.6,
    category: "Conservation",
    skills: ["Ecosystem Analysis", "Wildlife Protection", "Habitat Restoration"],
    instructor: "Dr. Emma Wild",
    image: "🦋"
  },
  {
    id: 5,
    title: "Green Technology Innovator",
    description: "Learn about cutting-edge green technologies and sustainable innovation.",
    difficulty: "Advanced",
    duration: "12 weeks",
    modules: 18,
    enrolled: 445,
    rating: 4.8,
    category: "Technology",
    skills: ["Green Tech", "Innovation", "Sustainable Engineering"],
    instructor: "Prof. Tech Green",
    image: "🔬"
  },
  {
    id: 6,
    title: "Environmental Policy Advocate",
    description: "Understand environmental policies and learn to advocate for sustainable change.",
    difficulty: "Intermediate",
    duration: "9 weeks",
    modules: 14,
    enrolled: 612,
    rating: 4.5,
    category: "Policy",
    skills: ["Policy Analysis", "Advocacy", "Environmental Law"],
    instructor: "Dr. Policy Green",
    image: "📋"
  }
];

const LearningPaths: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['All', 'Climate Science', 'Sustainability', 'Energy', 'Conservation', 'Technology', 'Policy'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredPaths = learningPaths.filter(path => {
    const matchesCategory = selectedCategory === 'All' || path.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || path.difficulty === selectedDifficulty;
    const matchesSearch = path.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         path.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              🎯 Learning Paths
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Structured learning journeys to master environmental skills and become an eco-champion!
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-lg">
              <div className="flex items-center gap-2">
                <TrophyIcon className="h-6 w-6" />
                <span>Earn Achievements</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpenIcon className="h-6 w-6" />
                <span>Expert-Led Content</span>
              </div>
              <div className="flex items-center gap-2">
                <UserGroupIcon className="h-6 w-6" />
                <span>Community Learning</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Paths</label>
              <input
                type="text"
                placeholder="Search learning paths..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Learning Paths Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPaths.map((path, index) => (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">{path.image}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(path.difficulty)}`}>
                    {path.difficulty}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">{path.title}</h3>
                <p className="text-green-100 text-sm">{path.description}</p>
              </div>

              {/* Card Body */}
              <div className="p-6">
                {/* Progress Bar (if enrolled) */}
                {path.progress && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{path.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${path.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Path Info */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    <span>{path.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpenIcon className="h-4 w-4" />
                    <span>{path.modules} modules</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <UserGroupIcon className="h-4 w-4" />
                    <span>{path.enrolled} enrolled</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{path.rating}</span>
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Skills you'll learn:</p>
                  <div className="flex flex-wrap gap-1">
                    {path.skills.map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Instructor */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Instructor:</span> {path.instructor}
                  </p>
                </div>

                {/* Action Button */}
                <Link
                  to={`/learning-path/${path.id}`}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 px-4 rounded-md hover:from-green-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                >
                  {path.progress ? (
                    <>
                      <PlayIcon className="h-4 w-4" />
                      Continue Learning
                    </>
                  ) : (
                    <>
                      <AcademicCapIcon className="h-4 w-4" />
                      Start Learning
                    </>
                  )}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredPaths.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No learning paths found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Your Environmental Journey?
            </h2>
            <p className="text-xl mb-8">
              Join thousands of learners making a difference for our planet!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-green-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors duration-300"
              >
                Get Started Free
              </Link>
              <Link
                to="/courses"
                className="border-2 border-white text-white px-8 py-3 rounded-md font-semibold hover:bg-white hover:text-green-600 transition-colors duration-300"
              >
                Browse All Courses
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LearningPaths;