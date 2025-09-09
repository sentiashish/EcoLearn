import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  PlusIcon,
  CheckIcon,
  StarIcon,
  ClockIcon,
  UserGroupIcon,
} from '@heroicons/react/24/solid';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface ModalTrailerProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  title: string;
  description: string;
  longDescription?: string;
  videoUrl?: string;
  thumbnailUrl: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  rating: number;
  reviewCount: number;
  enrollmentCount: number;
  instructor: {
    name: string;
    avatar?: string;
    bio?: string;
    rating?: number;
  };
  tags: string[];
  chapters?: {
    id: string;
    title: string;
    duration: string;
    isPreview?: boolean;
  }[];
  isInWatchlist?: boolean;
  isEnrolled?: boolean;
  onPlay?: (courseId: string) => void;
  onEnroll?: (courseId: string) => void;
  onAddToWatchlist?: (courseId: string) => void;
  onRemoveFromWatchlist?: (courseId: string) => void;
  className?: string;
}

const ModalTrailer: React.FC<ModalTrailerProps> = ({
  isOpen,
  onClose,
  courseId,
  title,
  description,
  longDescription,
  videoUrl,
  thumbnailUrl,
  category,
  difficulty,
  duration,
  rating,
  reviewCount,
  enrollmentCount,
  instructor,
  tags,
  chapters = [],
  isInWatchlist = false,
  isEnrolled = false,
  onPlay,
  onEnroll,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  className = '',
}) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showMoreDescription, setShowMoreDescription] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Focus the modal after a brief delay to ensure it's rendered
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);
    } else {
      // Return focus to the previously focused element
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
        case ' ':
          if (videoRef.current && isVideoLoaded) {
            event.preventDefault();
            togglePlayPause();
          }
          break;
        case 'ArrowLeft':
          if (videoRef.current && isVideoLoaded) {
            event.preventDefault();
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
          }
          break;
        case 'ArrowRight':
          if (videoRef.current && isVideoLoaded) {
            event.preventDefault();
            videoRef.current.currentTime = Math.min(videoDuration, videoRef.current.currentTime + 10);
          }
          break;
        case 'ArrowUp':
          if (videoRef.current && isVideoLoaded) {
            event.preventDefault();
            videoRef.current.volume = Math.min(1, videoRef.current.volume + 0.1);
          }
          break;
        case 'ArrowDown':
          if (videoRef.current && isVideoLoaded) {
            event.preventDefault();
            videoRef.current.volume = Math.max(0, videoRef.current.volume - 0.1);
          }
          break;
        case 'm':
        case 'M':
          if (videoRef.current && isVideoLoaded) {
            event.preventDefault();
            toggleMute();
          }
          break;
        case 'f':
        case 'F':
          if (videoRef.current && isVideoLoaded) {
            event.preventDefault();
            toggleFullscreen();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isVideoLoaded, videoDuration, onClose]);

  // Video event handlers
  const handleVideoLoadedData = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
      setIsVideoLoaded(true);
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoDuration) * 100;
      setVideoProgress(progress);
    }
  };

  const handleVideoEnded = () => {
    setIsVideoPlaying(false);
    setVideoProgress(0);
  };

  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  }, [isVideoPlaying]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isVideoMuted;
      setIsVideoMuted(!isVideoMuted);
    }
  }, [isVideoMuted]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      modalRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = event.currentTarget.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const newTime = (clickX / rect.width) * videoDuration;
      videoRef.current.currentTime = newTime;
    }
  };

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    if (isVideoPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isVideoPlaying]);

  useEffect(() => {
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  const handleWatchlistToggle = () => {
    if (isInWatchlist) {
      onRemoveFromWatchlist?.(courseId);
    } else {
      onAddToWatchlist?.(courseId);
    }
  };

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Animation variants
  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2,
        ease: 'easeIn',
      },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const contentVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          ref={modalRef}
          className={`relative w-full max-w-4xl max-h-[90vh] bg-background-elevated rounded-lg shadow-netflix overflow-hidden ${className}`}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 w-10 h-10 bg-background-primary/80 text-text-primary rounded-full flex items-center justify-center hover:bg-background-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-border-focus"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          {/* Video Section */}
          <div className="relative aspect-video bg-black">
            {videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  poster={thumbnailUrl}
                  muted={isVideoMuted}
                  onLoadedData={handleVideoLoadedData}
                  onTimeUpdate={handleVideoTimeUpdate}
                  onEnded={handleVideoEnded}
                  onMouseMove={resetControlsTimeout}
                  aria-label={`Video preview for ${title}`}
                >
                  <source src={videoUrl} type="video/mp4" />
                  <track kind="captions" src="" srcLang="en" label="English" />
                  Your browser does not support the video tag.
                </video>

                {/* Video Controls */}
                <AnimatePresence>
                  {showControls && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Play/Pause Button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button
                          onClick={togglePlayPause}
                          className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
                          aria-label={isVideoPlaying ? 'Pause video' : 'Play video'}
                        >
                          {isVideoPlaying ? (
                            <PauseIcon className="w-8 h-8 text-white" />
                          ) : (
                            <PlayIcon className="w-8 h-8 text-white ml-1" />
                          )}
                        </button>
                      </div>

                      {/* Bottom Controls */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        {/* Progress Bar */}
                        <div
                          className="w-full h-1 bg-white/30 rounded-full cursor-pointer mb-4"
                          onClick={handleProgressClick}
                          role="slider"
                          aria-label="Video progress"
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={videoProgress}
                        >
                          <div
                            className="h-full bg-netflix-red rounded-full transition-all duration-200"
                            style={{ width: `${videoProgress}%` }}
                          />
                        </div>

                        {/* Control Buttons */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={togglePlayPause}
                              className="text-white hover:text-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white rounded"
                              aria-label={isVideoPlaying ? 'Pause' : 'Play'}
                            >
                              {isVideoPlaying ? (
                                <PauseIcon className="w-6 h-6" />
                              ) : (
                                <PlayIcon className="w-6 h-6" />
                              )}
                            </button>

                            <button
                              onClick={toggleMute}
                              className="text-white hover:text-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white rounded"
                              aria-label={isVideoMuted ? 'Unmute' : 'Mute'}
                            >
                              {isVideoMuted ? (
                                <SpeakerXMarkIcon className="w-6 h-6" />
                              ) : (
                                <SpeakerWaveIcon className="w-6 h-6" />
                              )}
                            </button>

                            <span className="text-white text-sm">
                              {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(videoDuration)}
                            </span>
                          </div>

                          <button
                            onClick={toggleFullscreen}
                            className="text-white hover:text-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white rounded"
                            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                          >
                            {isFullscreen ? (
                              <ArrowsPointingInIcon className="w-6 h-6" />
                            ) : (
                              <ArrowsPointingOutIcon className="w-6 h-6" />
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <div
                className="w-full h-full bg-cover bg-center bg-no-repeat flex items-center justify-center"
                style={{ backgroundImage: `url(${thumbnailUrl})` }}
              >
                <div className="absolute inset-0 bg-black/40" />
                <button
                  onClick={() => onPlay?.(courseId)}
                  className="relative w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label={`Play ${title}`}
                >
                  <PlayIcon className="w-10 h-10 text-white ml-1" />
                </button>
              </div>
            )}
          </div>

          {/* Content Section */}
          <motion.div
            className="p-6 max-h-96 overflow-y-auto scrollbar-thin scrollbar-track-background-secondary scrollbar-thumb-border-secondary"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Header */}
            <motion.div className="mb-6" variants={itemVariants}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 id="modal-title" className="text-2xl font-bold text-text-primary mb-2">
                    {title}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-text-secondary mb-3">
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-4 h-4 text-accent-gold" />
                      <span>{rating.toFixed(1)}</span>
                      <span className="text-text-muted">({reviewCount.toLocaleString()} reviews)</span>
                    </div>
                    <span>•</span>
                    <span>{duration}</span>
                    <span>•</span>
                    <span className={`px-2 py-1 rounded ${getDifficultyBg(difficulty)} ${getDifficultyColor(difficulty)}`}>
                      {difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-tertiary">
                    <UserGroupIcon className="w-4 h-4" />
                    <span>{enrollmentCount.toLocaleString()} students enrolled</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 ml-6">
                  <button
                    onClick={handleWatchlistToggle}
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-border-focus ${
                      isInWatchlist
                        ? 'bg-white border-white text-black'
                        : 'border-border-secondary text-text-secondary hover:border-text-primary hover:text-text-primary'
                    }`}
                    aria-label={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                  >
                    {isInWatchlist ? (
                      <CheckIcon className="w-5 h-5" />
                    ) : (
                      <PlusIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Primary Action */}
              <div className="flex gap-3">
                {isEnrolled ? (
                  <button
                    onClick={() => onPlay?.(courseId)}
                    className="netflix-button flex items-center gap-2 px-6 py-3 text-lg font-semibold transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-netflix-red focus:ring-offset-2 focus:ring-offset-background-elevated"
                  >
                    <PlayIcon className="w-5 h-5" />
                    Continue Learning
                  </button>
                ) : (
                  <button
                    onClick={() => onEnroll?.(courseId)}
                    className="netflix-button flex items-center gap-2 px-6 py-3 text-lg font-semibold transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-netflix-red focus:ring-offset-2 focus:ring-offset-background-elevated"
                  >
                    Enroll Now
                  </button>
                )}
              </div>
            </motion.div>

            {/* Description */}
            <motion.div className="mb-6" variants={itemVariants}>
              <p id="modal-description" className="text-text-secondary leading-relaxed mb-3">
                {description}
              </p>
              {longDescription && (
                <>
                  <AnimatePresence>
                    {showMoreDescription && (
                      <motion.p
                        className="text-text-secondary leading-relaxed mb-3"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {longDescription}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <button
                    onClick={() => setShowMoreDescription(!showMoreDescription)}
                    className="flex items-center gap-1 text-text-primary hover:text-netflix-red transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-border-focus rounded"
                  >
                    <span>{showMoreDescription ? 'Show Less' : 'Show More'}</span>
                    <ChevronDownIcon
                      className={`w-4 h-4 transition-transform duration-200 ${
                        showMoreDescription ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </>
              )}
            </motion.div>

            {/* Instructor */}
            <motion.div className="mb-6" variants={itemVariants}>
              <h3 className="text-lg font-semibold text-text-primary mb-3">Instructor</h3>
              <div className="flex items-start gap-4">
                {instructor.avatar && (
                  <img
                    src={instructor.avatar}
                    alt={instructor.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-medium text-text-primary">{instructor.name}</h4>
                  {instructor.rating && (
                    <div className="flex items-center gap-1 text-sm text-text-secondary mb-1">
                      <StarIcon className="w-3 h-3 text-accent-gold" />
                      <span>{instructor.rating.toFixed(1)} instructor rating</span>
                    </div>
                  )}
                  {instructor.bio && (
                    <p className="text-sm text-text-secondary leading-relaxed">{instructor.bio}</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Tags */}
            {tags.length > 0 && (
              <motion.div className="mb-6" variants={itemVariants}>
                <h3 className="text-lg font-semibold text-text-primary mb-3">Topics Covered</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm bg-background-tertiary text-text-tertiary rounded-full border border-border-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Chapters */}
            {chapters.length > 0 && (
              <motion.div variants={itemVariants}>
                <h3 className="text-lg font-semibold text-text-primary mb-3">
                  Course Content ({chapters.length} chapters)
                </h3>
                <div className="space-y-2">
                  {chapters.slice(0, 5).map((chapter, index) => (
                    <div
                      key={chapter.id}
                      className="flex items-center justify-between p-3 bg-background-secondary rounded-lg border border-border-primary"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-text-muted font-medium">
                          {(index + 1).toString().padStart(2, '0')}
                        </span>
                        <div>
                          <h4 className="text-sm font-medium text-text-primary">{chapter.title}</h4>
                          {chapter.isPreview && (
                            <span className="text-xs text-accent-blue">Preview available</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <ClockIcon className="w-4 h-4" />
                        <span>{chapter.duration}</span>
                      </div>
                    </div>
                  ))}
                  {chapters.length > 5 && (
                    <p className="text-sm text-text-muted text-center py-2">
                      +{chapters.length - 5} more chapters
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ModalTrailer;
export type { ModalTrailerProps };