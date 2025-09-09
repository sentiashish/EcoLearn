import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import { PauseIcon } from '@heroicons/react/24/outline';

interface HeroSlide {
  id: string;
  title: string;
  description: string;
  backgroundImage: string;
  videoUrl?: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  rating: number;
  tags: string[];
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  onSlideClick?: (slide: HeroSlide) => void;
  onPlayClick?: (slide: HeroSlide) => void;
  className?: string;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({
  slides,
  autoPlay = true,
  autoPlayInterval = 5000,
  onSlideClick,
  onPlayClick,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState(0);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || isHovered || slides.length <= 1) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, isHovered, slides.length, autoPlayInterval]);

  // Navigation functions
  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }, [slides.length]);

  const goToPrevious = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = useCallback((index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNext();
          break;
        case ' ':
          event.preventDefault();
          setIsPlaying(!isPlaying);
          break;
        case 'Enter':
          if (onSlideClick) {
            event.preventDefault();
            onSlideClick(slides[currentIndex]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious, isPlaying, onSlideClick, slides, currentIndex]);

  if (!slides.length) {
    return (
      <div className="h-hero bg-background-secondary flex items-center justify-center">
        <p className="text-text-muted text-lg">No content available</p>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  const contentVariants = {
    hidden: {
      opacity: 0,
      y: 50,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.3,
        ease: 'easeOut',
      },
    },
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-accent-green';
      case 'Intermediate':
        return 'bg-accent-orange';
      case 'Advanced':
        return 'bg-netflix-red';
      default:
        return 'bg-accent-blue';
    }
  };

  return (
    <section
      className={`relative h-hero overflow-hidden bg-background-primary ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="region"
      aria-label="Featured content carousel"
      aria-live="polite"
    >
      {/* Background Slides */}
      <div className="absolute inset-0">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute inset-0"
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${currentSlide.backgroundImage})`,
              }}
              role="img"
              aria-label={`Background image for ${currentSlide.title}`}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-netflix-gradient" />
            
            {/* Content */}
            <motion.div
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              className="absolute inset-0 flex items-center"
            >
              <div className="container mx-auto px-8 lg:px-16">
                <div className="max-w-2xl">
                  {/* Category Badge */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-4"
                  >
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-background-elevated text-text-secondary border border-border-primary">
                      {currentSlide.category}
                    </span>
                  </motion.div>

                  {/* Title */}
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-4 leading-tight"
                  >
                    {currentSlide.title}
                  </motion.h1>

                  {/* Metadata */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-4 mb-6 text-sm text-text-secondary"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${getDifficultyColor(currentSlide.difficulty)}`} />
                      <span>{currentSlide.difficulty}</span>
                    </div>
                    <span>•</span>
                    <span>{currentSlide.duration}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <span className="text-accent-gold">★</span>
                      <span>{currentSlide.rating.toFixed(1)}</span>
                    </div>
                  </motion.div>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg text-text-secondary mb-6 leading-relaxed max-w-xl"
                  >
                    {currentSlide.description}
                  </motion.p>

                  {/* Tags */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap gap-2 mb-8"
                  >
                    {currentSlide.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-background-tertiary text-text-tertiary rounded border border-border-secondary"
                      >
                        {tag}
                      </span>
                    ))}
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    <button
                      onClick={() => onPlayClick?.(currentSlide)}
                      className="netflix-button flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-netflix-red focus:ring-offset-2 focus:ring-offset-background-primary"
                      aria-label={`Start learning ${currentSlide.title}`}
                    >
                      <PlayIcon className="w-6 h-6" />
                      Start Learning
                    </button>
                    
                    <button
                      onClick={() => onSlideClick?.(currentSlide)}
                      className="flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold bg-background-elevated/80 text-text-primary border border-border-secondary rounded-md transition-all duration-200 hover:bg-background-elevated hover:scale-105 focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 focus:ring-offset-background-primary"
                      aria-label={`More information about ${currentSlide.title}`}
                    >
                      <InformationCircleIcon className="w-6 h-6" />
                      More Info
                    </button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      {slides.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-background-elevated/80 text-text-primary rounded-full transition-all duration-200 hover:bg-background-elevated hover:scale-110 focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 focus:ring-offset-background-primary opacity-0 group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>

          {/* Next Button */}
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-background-elevated/80 text-text-primary rounded-full transition-all duration-200 hover:bg-background-elevated hover:scale-110 focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 focus:ring-offset-background-primary opacity-0 group-hover:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Play/Pause Control */}
      {autoPlay && (
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute top-4 right-4 z-10 p-3 bg-background-elevated/80 text-text-primary rounded-full transition-all duration-200 hover:bg-background-elevated hover:scale-110 focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 focus:ring-offset-background-primary"
          aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
        >
          {isPlaying ? (
            <PauseIcon className="w-5 h-5" />
          ) : (
            <PlayIcon className="w-5 h-5" />
          )}
        </button>
      )}

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="flex gap-2" role="tablist" aria-label="Slide navigation">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 focus:ring-offset-background-primary ${
                  index === currentIndex
                    ? 'bg-netflix-red scale-125'
                    : 'bg-background-elevated/60 hover:bg-background-elevated'
                }`}
                role="tab"
                aria-selected={index === currentIndex}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {autoPlay && isPlaying && !isHovered && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-background-elevated/30">
          <motion.div
            className="h-full bg-netflix-red"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{
              duration: autoPlayInterval / 1000,
              ease: 'linear',
            }}
            key={currentIndex}
          />
        </div>
      )}

      {/* Screen Reader Content */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Slide {currentIndex + 1} of {slides.length}: {currentSlide.title}
      </div>
    </section>
  );
};

export default HeroCarousel;
export type { HeroSlide, HeroCarouselProps };