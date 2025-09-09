import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CodeBracketIcon,
  ClockIcon,
  StarIcon,
  UserGroupIcon,
  TrophyIcon,
  FireIcon,
  CheckCircleIcon,
  PlayIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface Challenge {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  language: string;
  points: number;
  submissions: number;
  successRate: number;
  timeLimit: string;
  tags: string[];
  isCompleted?: boolean;
  bestScore?: number;
}

const challenges: Challenge[] = [
  {
    id: 1,
    title: "Carbon Footprint Calculator",
    description: "Build a calculator that estimates daily carbon emissions based on transportation, energy use, and consumption habits.",
    difficulty: "Easy",
    category: "Climate",
    language: "Python",
    points: 100,
    submissions: 1250,
    successRate: 78,
    timeLimit: "45 min",
    tags: ["Math", "Environment", "Beginner"],
    isCompleted: true,
    bestScore: 95
  },
  {
    id: 2,
    title: "Renewable Energy Optimizer",
    description: "Create an algorithm to optimize the placement of solar panels and wind turbines for maximum energy efficiency.",
    difficulty: "Hard",
    category: "Energy",
    language: "JavaScript",
    points: 300,
    submissions: 567,
    successRate: 45,
    timeLimit: "90 min",
    tags: ["Algorithm", "Optimization", "Advanced"]
  },
  {
    id: 3,
    title: "Waste Sorting Classifier",
    description: "Implement a machine learning model to classify waste items into recyclable, compostable, or landfill categories.",
    difficulty: "Medium",
    category: "Sustainability",
    language: "Python",
    points: 200,
    submissions: 890,
    successRate: 62,
    timeLimit: "60 min",
    tags: ["ML", "Classification", "Recycling"]
  },
  {
    id: 4,
    title: "Ecosystem Balance Simulator",
    description: "Model predator-prey relationships and environmental factors to simulate ecosystem balance over time.",
    difficulty: "Hard",
    category: "Conservation",
    language: "Java",
    points: 350,
    submissions: 423,
    successRate: 38,
    timeLimit: "120 min",
    tags: ["Simulation", "Biology", "Complex"]
  },
  {
    id: 5,
    title: "Green Route Planner",
    description: "Design an algorithm that finds the most environmentally friendly route considering traffic, vehicle type, and emissions.",
    difficulty: "Medium",
    category: "Transportation",
    language: "JavaScript",
    points: 250,
    submissions: 734,
    successRate: 55,
    timeLimit: "75 min",
    tags: ["Pathfinding", "Green Tech", "Maps"]
  },
  {
    id: 6,
    title: "Water Quality Monitor",
    description: "Create a system to analyze water quality data and predict pollution levels using sensor readings.",
    difficulty: "Medium",
    category: "Water",
    language: "Python",
    points: 220,
    submissions: 612,
    successRate: 68,
    timeLimit: "50 min",
    tags: ["Data Analysis", "Sensors", "Environment"]
  },
  {
    id: 7,
    title: "Smart Grid Energy Manager",
    description: "Implement a smart grid system that balances energy supply and demand while prioritizing renewable sources.",
    difficulty: "Hard",
    category: "Energy",
    language: "C++",
    points: 400,
    submissions: 289,
    successRate: 32,
    timeLimit: "150 min",
    tags: ["Grid", "Energy", "Expert"]
  },
  {
    id: 8,
    title: "Deforestation Tracker",
    description: "Analyze satellite imagery data to detect and track deforestation patterns over time.",
    difficulty: "Easy",
    category: "Conservation",
    language: "Python",
    points: 150,
    submissions: 945,
    successRate: 72,
    timeLimit: "40 min",
    tags: ["Image Processing", "Forests", "Tracking"]
  }
];

const Challenges: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  const categories = ['All', 'Climate', 'Energy', 'Sustainability', 'Conservation', 'Transportation', 'Water'];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];
  const languages = ['All', 'Python', 'JavaScript', 'Java', 'C++'];

  const filteredChallenges = challenges.filter(challenge => {
    const matchesCategory = selectedCategory === 'All' || challenge.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || challenge.difficulty === selectedDifficulty;
    const matchesLanguage = selectedLanguage === 'All' || challenge.language === selectedLanguage;
    const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompleted = !showCompleted || challenge.isCompleted;
    return matchesCategory && matchesDifficulty && matchesLanguage && matchesSearch && (!showCompleted || matchesCompleted);
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 70) return 'text-green-600';
    if (rate >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              🏆 Eco-Challenges
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Solve real-world environmental problems through code and earn eco-points!
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-lg">
              <div className="flex items-center gap-2">
                <CodeBracketIcon className="h-6 w-6" />
                <span>Code Solutions</span>
              </div>
              <div className="flex items-center gap-2">
                <TrophyIcon className="h-6 w-6" />
                <span>Earn Points</span>
              </div>
              <div className="flex items-center gap-2">
                <FireIcon className="h-6 w-6" />
                <span>Compete & Learn</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{challenges.length}</div>
            <div className="text-gray-600">Total Challenges</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {challenges.filter(c => c.isCompleted).length}
            </div>
            <div className="text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {challenges.reduce((sum, c) => sum + (c.bestScore || 0), 0)}
            </div>
            <div className="text-gray-600">Total Points</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {Math.round(challenges.reduce((sum, c) => sum + c.successRate, 0) / challenges.length)}%
            </div>
            <div className="text-gray-600">Avg Success Rate</div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FunnelIcon className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search challenges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>

            {/* Language Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languages.map(language => (
                  <option key={language} value={language}>{language}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Show Completed Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showCompleted"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="showCompleted" className="ml-2 text-sm text-gray-700">
              Show only completed challenges
            </label>
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredChallenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </span>
                    <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs font-medium">
                      {challenge.language}
                    </span>
                  </div>
                  {challenge.isCompleted && (
                    <CheckCircleIcon className="h-6 w-6 text-green-300" />
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2">{challenge.title}</h3>
                <p className="text-blue-100 text-sm">{challenge.description}</p>
              </div>

              {/* Card Body */}
              <div className="p-6">
                {/* Challenge Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <TrophyIcon className="h-4 w-4" />
                    <span>{challenge.points} points</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <ClockIcon className="h-4 w-4" />
                    <span>{challenge.timeLimit}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <UserGroupIcon className="h-4 w-4" />
                    <span>{challenge.submissions} submissions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarIcon className="h-4 w-4 text-yellow-400" />
                    <span className={getSuccessRateColor(challenge.successRate)}>
                      {challenge.successRate}% success
                    </span>
                  </div>
                </div>

                {/* Best Score (if completed) */}
                {challenge.bestScore && (
                  <div className="mb-4 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-800">Your Best Score</span>
                      <span className="text-lg font-bold text-green-600">{challenge.bestScore}/100</span>
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {challenge.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Link
                  to={`/challenge/${challenge.id}`}
                  className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-3 px-4 rounded-md hover:from-blue-600 hover:to-green-600 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                >
                  {challenge.isCompleted ? (
                    <>
                      <PlayIcon className="h-4 w-4" />
                      Try Again
                    </>
                  ) : (
                    <>
                      <CodeBracketIcon className="h-4 w-4" />
                      Start Challenge
                    </>
                  )}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredChallenges.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No challenges found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Code for the Planet?
            </h2>
            <p className="text-xl mb-8">
              Join the community of eco-coders making a real impact!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-blue-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors duration-300"
              >
                Join the Challenge
              </Link>
              <Link
                to="/leaderboard"
                className="border-2 border-white text-white px-8 py-3 rounded-md font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-300"
              >
                View Leaderboard
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Challenges;