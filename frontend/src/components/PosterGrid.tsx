import React from 'react';
import { Link } from 'react-router-dom';
import { Content, Challenge } from '@/types';
import { 
  ClockIcon, 
  FireIcon, 
  CheckCircleIcon,
  PlayIcon,
  CodeBracketIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckCircleSolidIcon
} from '@heroicons/react/24/solid';

interface PosterGridProps {
  items: (Content | Challenge)[];
  type: 'content' | 'challenges';
  loading?: boolean;
}

const PosterGrid: React.FC<PosterGridProps> = ({ items, type, loading = false }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (item: Content | Challenge) => {
    if ('is_completed' in item && item.is_completed) {
      return <CheckCircleSolidIcon className="h-5 w-5 text-green-500" />;
    }
    if ('progress' in item && item.progress > 0) {
      return <PlayIcon className="h-5 w-5 text-blue-500" />;
    }
    return null;
  };

  const getProgressBar = (item: Content | Challenge) => {
    if ('progress' in item && item.progress > 0) {
      return (
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{Math.round(item.progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-primary-600 h-1.5 rounded-full transition-all duration-300" 
              style={{ width: `${item.progress}%` }}
            ></div>
          </div>
        </div>
      );
    }
    return null;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
              <div className="flex justify-between items-center">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        {type === 'content' ? (
          <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
        ) : (
          <CodeBracketIcon className="mx-auto h-12 w-12 text-gray-400" />
        )}
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No {type} available
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {type === 'content' 
            ? 'Check back later for new learning content!' 
            : 'Check back later for new coding challenges!'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => {
        const isContent = 'content_type' in item;
        const linkTo = isContent ? `/lesson/${item.id}` : `/challenge/${item.id}`;
        
        return (
          <Link
            key={item.id}
            to={linkTo}
            className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
          >
            {/* Thumbnail/Header */}
            <div className="relative h-48 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              {/* Status Icon */}
              <div className="absolute top-3 right-3">
                {getStatusIcon(item)}
              </div>
              
              {/* Content Type Icon */}
              <div className="text-white">
                {isContent ? (
                  <BookOpenIcon className="h-16 w-16" />
                ) : (
                  <CodeBracketIcon className="h-16 w-16" />
                )}
              </div>
              
              {/* Difficulty Badge */}
              <div className="absolute bottom-3 left-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty)}`}>
                  {item.difficulty}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                {item.title}
              </h3>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {item.description}
              </p>

              {/* Progress Bar */}
              {getProgressBar(item)}

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-500">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {isContent 
                    ? formatDuration((item as Content).estimated_duration)
                    : 'Challenge'
                  }
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <FireIcon className="h-4 w-4 mr-1" />
                  {item.points} pts
                </div>
              </div>

              {/* Additional Info for Challenges */}
              {!isContent && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Language: {(item as Challenge).language}</span>
                    {(item as Challenge).submissions_count > 0 && (
                      <span>{(item as Challenge).submissions_count} submissions</span>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Info for Content */}
              {isContent && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Type: {(item as Content).content_type}</span>
                    {(item as Content).prerequisites && (item as Content).prerequisites.length > 0 && (
                      <span>{(item as Content).prerequisites.length} prereq(s)</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default PosterGrid;