import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayIcon, PlusIcon, ChevronDownIcon, ClockIcon, StarIcon } from '@heroicons/react/24/solid';
import { CheckIcon } from '@heroicons/react/24/outline';

interface PosterCardProps {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  rating: number;
  progress?: number; // 0-100
  isCompleted?: boolean;
  isInWatchlist?: boolean;
  tags: string[];
  instructor?: string;
  enrollmentCount?: number;
  onPlay?: (id: string) => void;
  onAddToWatchlist?: (id: string) => void;
  onRemoveFromWatchlist?: (id: string) => void;
  onMoreInfo?: (id: string) => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
}

const PosterCard: React.FC<PosterCardProps> = ({
  id,
  title,
  description,
  thumbnail,
  category,
  difficulty,
  duration,
  rating,
  progress = 0,
  isCompleted = false,
  isInWatchlist = false,
  tags,
  instructor,
  enrollmentCount,
  onPlay,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  onMoreInfo,
  className = '',
  size = 'medium',
  showProgress = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Size configurations
  const sizeConfig = {
    small: {
      container: 'w-48 h-28',
      expanded: 'w-72 h-96',
      image: 'h-28',
      expandedImage: 'h-40',
    },
    medium: {
      container: 'w-64 h-36',
      expanded: 'w-80 h-[28rem]',
      image: 'h-36',
      expandedImage: 'h-48',
    },
    large: {
      container: 'w-80 h-44',
      expanded: 'w-96 h-[32rem]',
      image: 'h-44',
      expandedImage: 'h-56',
    },
  };

  const config = sizeConfig[size];

  // Handle hover with delay
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(false);
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'text-accent-green';
      case 'Intermediate':
        return 'text-accent-orange';
      case 'Advanced':
        return 'text-netflix-red';
      default:
        return 'text-accent-blue';
    }
  };

  const getDifficultyBg = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-accent-green/20';
      case 'Intermediate':
        return 'bg-accent-orange/20';
      case 'Advanced':
        return 'bg-netflix-red/20';
      default:
        return 'bg-accent-blue/20';
    }
  };

  const handleWatchlistToggle = () => {
    if (isInWatchlist) {
      onRemoveFromWatchlist?.(id);
    } else {
      onAddToWatchlist?.(id);
    }
  };

  const cardVariants = {
    initial: {
      scale: 1,
      zIndex: 1,
    },
    hover: {
      scale: 1.05,
      zIndex: 10,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  };

  const expandedVariants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      y: 20,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: 'easeIn',
      },
    },
  };

  const contentVariants = {
    initial: {
      opacity: 0,
      y: 10,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative group cursor-pointer ${className}`}
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="article"
      aria-label={`Course: ${title}`}
    >
      {/* Base Card */}
      <div className={`relative ${config.container} rounded-lg overflow-hidden bg-background-secondary border border-border-primary transition-all duration-300`}>
        {/* Thumbnail Image */}
        <div className={`relative ${config.image} overflow-hidden`}>
          {!imageError ? (
            <img
              src={thumbnail}
              alt={title}
              className={`w-full h-full object-cover transition-all duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-background-tertiary flex items-center justify-center">
              <div className="text-text-muted text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-background-elevated rounded-lg flex items-center justify-center">
                  <PlayIcon className="w-6 h-6" />
                </div>
                <p className="text-xs">Image unavailable</p>
              </div>
            </div>
          )}

          {/* Loading Skeleton */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-background-tertiary animate-pulse" />
          )}

          {/* Progress Bar */}
          {showProgress && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-background-elevated/30">
              <div
                className="h-full bg-netflix-red transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Completion Badge */}
          {isCompleted && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-accent-green rounded-full flex items-center justify-center">
              <CheckIcon className="w-4 h-4 text-white" />
            </div>
          )}

          {/* Difficulty Badge */}
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyBg(difficulty)} ${getDifficultyColor(difficulty)}`}>
              {difficulty}
            </span>
          </div>
        </div>

        {/* Basic Info (Always Visible) */}
        <div className="p-3">
          <h3 className="text-sm font-semibold text-text-primary line-clamp-2 mb-1">
            {title}
          </h3>
          <p className="text-xs text-text-secondary">{category}</p>
        </div>
      </div>

      {/* Expanded Card on Hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className={`absolute top-0 left-0 ${config.expanded} bg-background-elevated border border-border-secondary rounded-lg shadow-netflix z-20 overflow-hidden`}
            variants={expandedVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Expanded Image */}
            <div className={`relative ${config.expandedImage} overflow-hidden`}>
              {!imageError ? (
                <img
                  src={thumbnail}
                  alt={title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-background-tertiary flex items-center justify-center">
                  <div className="text-text-muted text-center">
                    <div className="w-16 h-16 mx-auto mb-3 bg-background-elevated rounded-lg flex items-center justify-center">
                      <PlayIcon className="w-8 h-8" />
                    </div>
                    <p className="text-sm">Image unavailable</p>
                  </div>
                </div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background-elevated via-transparent to-transparent" />

              {/* Play Button Overlay */}
              <motion.button
                onClick={() => onPlay?.(id)}
                className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-200 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`Play ${title}`}
              >
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:bg-white transition-colors duration-200">
                  <PlayIcon className="w-8 h-8 text-black ml-1" />
                </div>
              </motion.button>

              {/* Progress Bar */}
              {showProgress && progress > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-background-elevated/30">
                  <div
                    className="h-full bg-netflix-red"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Expanded Content */}
            <motion.div className="p-4 space-y-3" variants={contentVariants}>
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => onPlay?.(id)}
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={`Play ${title}`}
                >
                  <PlayIcon className="w-4 h-4 text-black ml-0.5" />
                </motion.button>

                <motion.button
                  onClick={handleWatchlistToggle}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    isInWatchlist
                      ? 'bg-white border-white text-black'
                      : 'border-gray-400 text-gray-400 hover:border-white hover:text-white'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={isInWatchlist ? `Remove ${title} from watchlist` : `Add ${title} to watchlist`}
                >
                  {isInWatchlist ? (
                    <CheckIcon className="w-4 h-4" />
                  ) : (
                    <PlusIcon className="w-4 h-4" />
                  )}
                </motion.button>

                <motion.button
                  onClick={() => onMoreInfo?.(id)}
                  className="w-8 h-8 border-2 border-gray-400 text-gray-400 rounded-full flex items-center justify-center hover:border-white hover:text-white transition-all duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={`More information about ${title}`}
                >
                  <ChevronDownIcon className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Title and Description */}
              <div>
                <h3 className="text-lg font-bold text-text-primary mb-2 line-clamp-2">
                  {title}
                </h3>
                <p className="text-sm text-text-secondary line-clamp-3 leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Metadata */}
              <div className="space-y-2">
                <div className="flex items-center gap-4 text-xs text-text-secondary">
                  <div className="flex items-center gap-1">
                    <StarIcon className="w-3 h-3 text-accent-gold" />
                    <span>{rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    <span>{duration}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded ${getDifficultyBg(difficulty)} ${getDifficultyColor(difficulty)}`}>
                    {difficulty}
                  </span>
                </div>

                {instructor && (
                  <p className="text-xs text-text-tertiary">
                    Instructor: <span className="text-text-secondary">{instructor}</span>
                  </p>
                )}

                {enrollmentCount && (
                  <p className="text-xs text-text-tertiary">
                    {enrollmentCount.toLocaleString()} students enrolled
                  </p>
                )}
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 text-xs bg-background-tertiary text-text-tertiary rounded border border-border-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                  {tags.length > 3 && (
                    <span className="px-2 py-0.5 text-xs text-text-muted">
                      +{tags.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Progress Text */}
              {showProgress && progress > 0 && (
                <div className="text-xs text-text-secondary">
                  {isCompleted ? (
                    <span className="text-accent-green">✓ Completed</span>
                  ) : (
                    <span>{progress}% complete</span>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PosterCard;
export type { PosterCardProps };

// Utility component for poster card grid
export const PosterCardGrid: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 ${className}`}>
      {children}
    </div>
  );
};

// Utility component for poster card row
export const PosterCardRow: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`flex gap-4 overflow-x-auto scrollbar-hide pb-4 ${className}`}>
      {children}
    </div>
  );
};