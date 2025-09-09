import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BookmarkIcon,
  ShareIcon,
  AdjustmentsHorizontalIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  StarIcon,
  UserGroupIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/solid';
import { BookmarkIcon as BookmarkOutline } from '@heroicons/react/24/outline';

interface LessonContent {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
  transcript?: string;
  resources?: {
    id: string;
    title: string;
    type: 'pdf' | 'link' | 'code';
    url: string;
  }[];
  quiz?: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
}

interface Chapter {
  id: string;
  title: string;
  lessons: {
    id: string;
    title: string;
    duration: string;
    isCompleted: boolean;
    isLocked: boolean;
  }[];
  isCompleted: boolean;
}

interface CourseProgress {
  completedLessons: number;
  totalLessons: number;
  completedQuizzes: number;
  totalQuizzes: number;
  timeSpent: string;
  lastAccessed: string;
}

interface LessonDetailViewProps {
  courseId: string;
  lessonId: string;
  courseTitle: string;
  instructor: {
    name: string;
    avatar: string;
    bio: string;
    rating: number;
  };
  chapters: Chapter[];
  currentLesson: LessonContent;
  progress: CourseProgress;
  onLessonComplete?: (lessonId: string) => void;
  onNavigateLesson?: (lessonId: string) => void;
  onBookmarkToggle?: (lessonId: string) => void;
  isBookmarked?: boolean;
}

const LessonDetailView: React.FC<LessonDetailViewProps> = ({
  courseId,
  lessonId,
  courseTitle,
  instructor,
  chapters,
  currentLesson,
  progress,
  onLessonComplete,
  onNavigateLesson,
  onBookmarkToggle,
  isBookmarked = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'discussion'>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notes, setNotes] = useState('');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  // Video event handlers
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = event.currentTarget.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const newTime = (clickX / rect.width) * duration;
      videoRef.current.currentTime = newTime;
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  // Navigation helpers
  const getCurrentLessonIndex = () => {
    let index = 0;
    for (const chapter of chapters) {
      for (const lesson of chapter.lessons) {
        if (lesson.id === lessonId) {
          return index;
        }
        index++;
      }
    }
    return -1;
  };

  const getNextLesson = () => {
    const allLessons = chapters.flatMap(chapter => chapter.lessons);
    const currentIndex = getCurrentLessonIndex();
    return currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  };

  const getPreviousLesson = () => {
    const allLessons = chapters.flatMap(chapter => chapter.lessons);
    const currentIndex = getCurrentLessonIndex();
    return currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  };

  const handleLessonNavigation = (direction: 'next' | 'previous') => {
    const lesson = direction === 'next' ? getNextLesson() : getPreviousLesson();
    if (lesson && !lesson.isLocked) {
      onNavigateLesson?.(lesson.id);
    }
  };

  // Quiz handling
  const handleQuizAnswer = (questionId: string, answerIndex: number) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleQuizSubmit = () => {
    // Process quiz results
    console.log('Quiz answers:', quizAnswers);
    setShowQuiz(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement) {
        return;
      }

      switch (event.key) {
        case ' ':
          event.preventDefault();
          handlePlayPause();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          handleVolumeChange(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          event.preventDefault();
          handleVolumeChange(Math.max(0, volume - 0.1));
          break;
        case 'n':
        case 'N':
          event.preventDefault();
          setShowNotes(!showNotes);
          break;
        case 't':
        case 'T':
          event.preventDefault();
          setShowTranscript(!showTranscript);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, duration, showNotes, showTranscript]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (progress.completedLessons / progress.totalLessons) * 100;

  return (
    <div className="min-h-screen bg-background-primary flex">
      {/* Sidebar - Course Navigation */}
      <motion.aside
        className={`${sidebarCollapsed ? 'w-16' : 'w-80'} bg-background-secondary border-r border-border-primary transition-all duration-300 flex-shrink-0`}
        initial={false}
        animate={{ width: sidebarCollapsed ? 64 : 320 }}
      >
        <div className="p-4">
          {/* Course Header */}
          <div className="mb-6">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-8 h-8 bg-background-elevated rounded-lg flex items-center justify-center mb-4 hover:bg-background-tertiary transition-colors duration-200"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4 text-text-secondary" />
            </button>
            
            {!sidebarCollapsed && (
              <>
                <h1 className="text-lg font-bold text-text-primary mb-2 line-clamp-2">
                  {courseTitle}
                </h1>
                
                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
                    <span>Course Progress</span>
                    <span>{Math.round(progressPercentage)}%</span>
                  </div>
                  <div className="w-full h-2 bg-background-tertiary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-accent-green"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-text-muted mt-1">
                    <span>{progress.completedLessons}/{progress.totalLessons} lessons</span>
                    <span>{progress.timeSpent} spent</span>
                  </div>
                </div>

                {/* Instructor */}
                <div className="flex items-center gap-3 p-3 bg-background-elevated rounded-lg">
                  <img
                    src={instructor.avatar}
                    alt={instructor.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-text-primary truncate">
                      {instructor.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-text-secondary">
                      <StarIcon className="w-3 h-3 text-accent-gold" />
                      <span>{instructor.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Chapter List */}
          {!sidebarCollapsed && (
            <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto scrollbar-thin scrollbar-track-background-secondary scrollbar-thumb-border-secondary">
              {chapters.map((chapter, chapterIndex) => (
                <div key={chapter.id} className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                    {chapter.isCompleted ? (
                      <CheckCircleIcon className="w-4 h-4 text-accent-green" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-border-secondary" />
                    )}
                    <span>Chapter {chapterIndex + 1}: {chapter.title}</span>
                  </div>
                  
                  <div className="ml-6 space-y-1">
                    {chapter.lessons.map((lesson, lessonIndex) => (
                      <button
                        key={lesson.id}
                        onClick={() => !lesson.isLocked && onNavigateLesson?.(lesson.id)}
                        disabled={lesson.isLocked}
                        className={`w-full text-left p-2 rounded-lg text-sm transition-all duration-200 ${
                          lesson.id === lessonId
                            ? 'bg-netflix-red text-white'
                            : lesson.isLocked
                            ? 'text-text-muted cursor-not-allowed'
                            : 'text-text-secondary hover:bg-background-elevated hover:text-text-primary'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {lesson.isCompleted ? (
                            <CheckCircleIcon className="w-3 h-3 text-accent-green" />
                          ) : lesson.isLocked ? (
                            <div className="w-3 h-3 rounded-full bg-text-muted" />
                          ) : (
                            <div className="w-3 h-3 rounded-full border border-current" />
                          )}
                          <span className="flex-1 truncate">{lesson.title}</span>
                          <span className="text-xs opacity-75">{lesson.duration}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Video Player */}
        <div className="relative bg-black aspect-video">
          <video
            ref={videoRef}
            className="w-full h-full"
            src={currentLesson.videoUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => onLessonComplete?.(lessonId)}
          />

          {/* Video Controls Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
            {/* Play/Pause Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={handlePlayPause}
                className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
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
              >
                <div
                  className="h-full bg-netflix-red rounded-full"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePlayPause}
                    className="text-white hover:text-gray-300 transition-colors duration-200"
                  >
                    {isPlaying ? (
                      <PauseIcon className="w-6 h-6" />
                    ) : (
                      <PlayIcon className="w-6 h-6" />
                    )}
                  </button>
                  
                  <span className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Speed Control */}
                  <select
                    value={playbackSpeed}
                    onChange={(e) => handleSpeedChange(Number(e.target.value))}
                    className="bg-black/50 text-white text-sm rounded px-2 py-1 border border-white/30"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={0.75}>0.75x</option>
                    <option value={1}>1x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() => handleLessonNavigation('previous')}
            disabled={!getPreviousLesson()}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous lesson"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>

          <button
            onClick={() => handleLessonNavigation('next')}
            disabled={!getNextLesson()}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next lesson"
          >
            <ArrowRightIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Lesson Content */}
        <div className="flex-1 p-6">
          {/* Lesson Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                {currentLesson.title}
              </h1>
              <p className="text-text-secondary leading-relaxed mb-4">
                {currentLesson.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-text-muted">
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>{currentLesson.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <AcademicCapIcon className="w-4 h-4" />
                  <span>Lesson {getCurrentLessonIndex() + 1}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 ml-6">
              <button
                onClick={() => onBookmarkToggle?.(lessonId)}
                className="w-10 h-10 bg-background-elevated border border-border-primary rounded-lg flex items-center justify-center hover:bg-background-tertiary transition-colors duration-200"
                aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
              >
                {isBookmarked ? (
                  <BookmarkIcon className="w-5 h-5 text-accent-gold" />
                ) : (
                  <BookmarkOutline className="w-5 h-5 text-text-secondary" />
                )}
              </button>
              
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="w-10 h-10 bg-background-elevated border border-border-primary rounded-lg flex items-center justify-center hover:bg-background-tertiary transition-colors duration-200"
                aria-label="Toggle notes"
              >
                <DocumentTextIcon className="w-5 h-5 text-text-secondary" />
              </button>
              
              <button className="w-10 h-10 bg-background-elevated border border-border-primary rounded-lg flex items-center justify-center hover:bg-background-tertiary transition-colors duration-200">
                <ShareIcon className="w-5 h-5 text-text-secondary" />
              </button>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="border-b border-border-primary mb-6">
            <nav className="flex gap-8">
              {[
                { id: 'overview', label: 'Overview', icon: DocumentTextIcon },
                { id: 'resources', label: 'Resources', icon: BookmarkIcon },
                { id: 'discussion', label: 'Discussion', icon: ChatBubbleLeftRightIcon },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 pb-4 border-b-2 transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-netflix-red text-netflix-red'
                      : 'border-transparent text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Transcript */}
                  {currentLesson.transcript && (
                    <div>
                      <button
                        onClick={() => setShowTranscript(!showTranscript)}
                        className="flex items-center gap-2 text-lg font-semibold text-text-primary mb-4 hover:text-netflix-red transition-colors duration-200"
                      >
                        <DocumentTextIcon className="w-5 h-5" />
                        <span>Transcript</span>
                      </button>
                      
                      <AnimatePresence>
                        {showTranscript && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-background-elevated border border-border-primary rounded-lg p-4 text-text-secondary leading-relaxed"
                          >
                            {currentLesson.transcript}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Quiz */}
                  {currentLesson.quiz && (
                    <div>
                      <button
                        onClick={() => setShowQuiz(!showQuiz)}
                        className="netflix-button px-6 py-3 font-semibold"
                      >
                        Take Quiz
                      </button>
                      
                      <AnimatePresence>
                        {showQuiz && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="mt-6 space-y-6"
                          >
                            {currentLesson.quiz.map((question, index) => (
                              <div key={question.id} className="bg-background-elevated border border-border-primary rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-text-primary mb-4">
                                  {index + 1}. {question.question}
                                </h3>
                                <div className="space-y-2">
                                  {question.options.map((option, optionIndex) => (
                                    <label
                                      key={optionIndex}
                                      className="flex items-center gap-3 p-3 rounded-lg border border-border-secondary hover:bg-background-tertiary transition-colors duration-200 cursor-pointer"
                                    >
                                      <input
                                        type="radio"
                                        name={`question-${question.id}`}
                                        value={optionIndex}
                                        onChange={() => handleQuizAnswer(question.id, optionIndex)}
                                        className="w-4 h-4 text-netflix-red"
                                      />
                                      <span className="text-text-secondary">{option}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            ))}
                            
                            <button
                              onClick={handleQuizSubmit}
                              className="netflix-button px-6 py-3 font-semibold"
                            >
                              Submit Quiz
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'resources' && (
                <div className="space-y-4">
                  {currentLesson.resources?.map((resource) => (
                    <div key={resource.id} className="bg-background-elevated border border-border-primary rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-text-primary">{resource.title}</h3>
                          <p className="text-sm text-text-secondary capitalize">{resource.type}</p>
                        </div>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-netflix-red text-white rounded-lg hover:bg-netflix-red/90 transition-colors duration-200"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  )) || (
                    <p className="text-text-muted text-center py-8">No resources available for this lesson.</p>
                  )}
                </div>
              )}

              {activeTab === 'discussion' && (
                <div className="text-center py-8">
                  <ChatBubbleLeftRightIcon className="w-12 h-12 text-text-muted mx-auto mb-4" />
                  <p className="text-text-muted">Discussion feature coming soon!</p>
                </div>
              )}
            </div>

            {/* Notes Panel */}
            <div className="lg:col-span-1">
              <div className="bg-background-elevated border border-border-primary rounded-lg p-4">
                <h3 className="text-lg font-semibold text-text-primary mb-4">My Notes</h3>
                <textarea
                  ref={notesRef}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Take notes while watching..."
                  className="w-full h-64 bg-background-secondary border border-border-secondary rounded-lg p-3 text-text-secondary placeholder-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-netflix-red focus:border-transparent"
                />
                <button className="w-full mt-3 px-4 py-2 bg-netflix-red text-white rounded-lg hover:bg-netflix-red/90 transition-colors duration-200">
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonDetailView;
export type { LessonDetailViewProps, LessonContent, Chapter, CourseProgress };