import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpenIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  LinkIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

interface Resource {
  id: number;
  title: string;
  description: string;
  type: 'Article' | 'Video' | 'Tool' | 'Dataset' | 'Guide' | 'Research';
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration?: string;
  author: string;
  publishDate: string;
  views: number;
  likes: number;
  downloads?: number;
  url: string;
  tags: string[];
  isFavorite?: boolean;
  thumbnail: string;
}

const resources: Resource[] = [
  {
    id: 1,
    title: "Climate Change: The Science Behind Global Warming",
    description: "Comprehensive guide to understanding the scientific principles behind climate change and global warming effects.",
    type: "Article",
    category: "Climate Science",
    difficulty: "Beginner",
    duration: "15 min read",
    author: "Dr. Sarah Climate",
    publishDate: "2024-01-15",
    views: 12500,
    likes: 890,
    url: "#",
    tags: ["Climate", "Science", "Global Warming"],
    isFavorite: true,
    thumbnail: "🌡️"
  },
  {
    id: 2,
    title: "Renewable Energy Systems Design",
    description: "Interactive tool for designing and optimizing renewable energy systems including solar, wind, and hydro power.",
    type: "Tool",
    category: "Energy",
    difficulty: "Advanced",
    author: "GreenTech Solutions",
    publishDate: "2024-01-10",
    views: 8750,
    likes: 654,
    downloads: 1200,
    url: "#",
    tags: ["Solar", "Wind", "Design", "Calculator"],
    thumbnail: "⚡"
  },
  {
    id: 3,
    title: "Sustainable Living: 50 Practical Tips",
    description: "Video series covering practical tips for sustainable living, from reducing waste to energy conservation.",
    type: "Video",
    category: "Sustainability",
    difficulty: "Beginner",
    duration: "45 min",
    author: "EcoLife Channel",
    publishDate: "2024-01-08",
    views: 25600,
    likes: 1850,
    url: "#",
    tags: ["Lifestyle", "Tips", "Waste Reduction"],
    thumbnail: "♻️"
  },
  {
    id: 4,
    title: "Global Carbon Emissions Dataset 2023",
    description: "Comprehensive dataset containing global carbon emissions data by country, sector, and time period.",
    type: "Dataset",
    category: "Data",
    difficulty: "Intermediate",
    author: "Environmental Data Consortium",
    publishDate: "2024-01-05",
    views: 5400,
    likes: 320,
    downloads: 890,
    url: "#",
    tags: ["Data", "Carbon", "Emissions", "Statistics"],
    thumbnail: "📊"
  },
  {
    id: 5,
    title: "Biodiversity Conservation Strategies",
    description: "Research paper on effective biodiversity conservation strategies and their implementation worldwide.",
    type: "Research",
    category: "Conservation",
    difficulty: "Advanced",
    duration: "30 min read",
    author: "Dr. Bio Diversity",
    publishDate: "2024-01-03",
    views: 7200,
    likes: 445,
    url: "#",
    tags: ["Biodiversity", "Conservation", "Research"],
    thumbnail: "🦋"
  },
  {
    id: 6,
    title: "Green Building Design Guide",
    description: "Complete guide to sustainable architecture and green building practices for environmentally conscious construction.",
    type: "Guide",
    category: "Architecture",
    difficulty: "Intermediate",
    duration: "25 min read",
    author: "Sustainable Architecture Institute",
    publishDate: "2024-01-01",
    views: 9800,
    likes: 720,
    downloads: 650,
    url: "#",
    tags: ["Architecture", "Green Building", "Design"],
    thumbnail: "🏗️"
  },
  {
    id: 7,
    title: "Ocean Pollution Impact Assessment",
    description: "Interactive tool to assess and visualize the impact of plastic pollution on marine ecosystems.",
    type: "Tool",
    category: "Marine",
    difficulty: "Intermediate",
    author: "Ocean Conservation Lab",
    publishDate: "2023-12-28",
    views: 6700,
    likes: 480,
    downloads: 340,
    url: "#",
    tags: ["Ocean", "Pollution", "Marine Life"],
    thumbnail: "🌊"
  },
  {
    id: 8,
    title: "Electric Vehicle Transition Analysis",
    description: "Comprehensive analysis of the global transition to electric vehicles and its environmental impact.",
    type: "Article",
    category: "Transportation",
    difficulty: "Intermediate",
    duration: "20 min read",
    author: "Clean Transport Research",
    publishDate: "2023-12-25",
    views: 11200,
    likes: 890,
    url: "#",
    tags: ["Electric Vehicles", "Transportation", "Analysis"],
    thumbnail: "🚗"
  }
];

const Resources: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);

  const categories = ['All', 'Climate Science', 'Energy', 'Sustainability', 'Data', 'Conservation', 'Architecture', 'Marine', 'Transportation'];
  const types = ['All', 'Article', 'Video', 'Tool', 'Dataset', 'Guide', 'Research'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'All' || resource.category === selectedCategory;
    const matchesType = selectedType === 'All' || resource.type === selectedType;
    const matchesDifficulty = selectedDifficulty === 'All' || resource.difficulty === selectedDifficulty;
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFavorites = !showFavorites || resource.isFavorite;
    return matchesCategory && matchesType && matchesDifficulty && matchesSearch && matchesFavorites;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Article': return <DocumentTextIcon className="h-5 w-5" />;
      case 'Video': return <VideoCameraIcon className="h-5 w-5" />;
      case 'Tool': return <BeakerIcon className="h-5 w-5" />;
      case 'Dataset': return <DocumentTextIcon className="h-5 w-5" />;
      case 'Guide': return <BookOpenIcon className="h-5 w-5" />;
      case 'Research': return <AcademicCapIcon className="h-5 w-5" />;
      default: return <DocumentTextIcon className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Article': return 'bg-blue-100 text-blue-800';
      case 'Video': return 'bg-red-100 text-red-800';
      case 'Tool': return 'bg-green-100 text-green-800';
      case 'Dataset': return 'bg-purple-100 text-purple-800';
      case 'Guide': return 'bg-yellow-100 text-yellow-800';
      case 'Research': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
              📚 Learning Resources
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Discover curated educational materials, tools, and research to deepen your environmental knowledge!
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-lg">
              <div className="flex items-center gap-2">
                <BookOpenIcon className="h-6 w-6" />
                <span>Articles & Guides</span>
              </div>
              <div className="flex items-center gap-2">
                <BeakerIcon className="h-6 w-6" />
                <span>Interactive Tools</span>
              </div>
              <div className="flex items-center gap-2">
                <GlobeAltIcon className="h-6 w-6" />
                <span>Research & Data</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{resources.length}</div>
            <div className="text-gray-600">Total Resources</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {resources.reduce((sum, r) => sum + r.views, 0).toLocaleString()}
            </div>
            <div className="text-gray-600">Total Views</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {resources.reduce((sum, r) => sum + r.likes, 0).toLocaleString()}
            </div>
            <div className="text-gray-600">Total Likes</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {resources.reduce((sum, r) => sum + (r.downloads || 0), 0).toLocaleString()}
            </div>
            <div className="text-gray-600">Downloads</div>
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
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
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

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
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

          {/* Show Favorites Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showFavorites"
              checked={showFavorites}
              onChange={(e) => setShowFavorites(e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="showFavorites" className="ml-2 text-sm text-gray-700">
              Show only favorites
            </label>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource, index) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{resource.thumbnail}</span>
                  {resource.isFavorite && (
                    <HeartIcon className="h-5 w-5 text-red-300 fill-current" />
                  )}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getTypeColor(resource.type)}`}>
                    {getTypeIcon(resource.type)}
                    {resource.type}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(resource.difficulty)}`}>
                    {resource.difficulty}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2 line-clamp-2">{resource.title}</h3>
              </div>

              {/* Card Body */}
              <div className="p-4">
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{resource.description}</p>

                {/* Resource Info */}
                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Author:</span>
                    <span className="font-medium">{resource.author}</span>
                  </div>
                  {resource.duration && (
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">{resource.duration}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Published:</span>
                    <span className="font-medium">{new Date(resource.publishDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <EyeIcon className="h-4 w-4" />
                    <span>{resource.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <HeartIcon className="h-4 w-4" />
                    <span>{resource.likes.toLocaleString()}</span>
                  </div>
                  {resource.downloads && (
                    <div className="flex items-center gap-1">
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      <span>{resource.downloads.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {resource.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {resource.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        +{resource.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 px-3 rounded-md hover:from-green-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <LinkIcon className="h-4 w-4" />
                    View Resource
                  </a>
                  <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-300">
                    <ShareIcon className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No resources found</h3>
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
              Contribute to Our Resource Library
            </h2>
            <p className="text-xl mb-8">
              Have valuable environmental resources to share? Help grow our community knowledge base!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="bg-white text-green-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors duration-300"
              >
                Submit Resource
              </Link>
              <Link
                to="/courses"
                className="border-2 border-white text-white px-8 py-3 rounded-md font-semibold hover:bg-white hover:text-green-600 transition-colors duration-300"
              >
                Explore Courses
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Resources;