import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import HeroCarousel, { HeroSlide } from '../components/HeroCarousel';
import PosterCard, { PosterCardRow } from '../components/PosterCard';
import ModalTrailer from '../components/ModalTrailer';
import { ChevronRightIcon, AcademicCapIcon, TrophyIcon, ClockIcon } from '@heroicons/react/24/solid';

// Sample data interfaces
interface Course {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  thumbnail: string;
  videoUrl?: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  rating: number;
  reviewCount: number;
  enrollmentCount: number;
  progress?: number;
  isCompleted?: boolean;
  isInWatchlist?: boolean;
  tags: string[];
  instructor: {
    name: string;
    avatar?: string;
    bio?: string;
    rating?: number;
  };
  chapters?: {
    id: string;
    title: string;
    duration: string;
    isPreview?: boolean;
  }[];
}

interface CourseSection {
  id: string;
  title: string;
  subtitle?: string;
  courses: Course[];
  viewAllLink?: string;
}

const Homepage: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [enrolledCourses, setEnrolledCourses] = useState<Set<string>>(new Set());

  // Sample hero slides data
  const heroSlides: HeroSlide[] = [
    {
      id: '1',
      title: 'Master React Development',
      description: 'Build modern web applications with React, TypeScript, and the latest development practices. Learn from industry experts and create real-world projects.',
      backgroundImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1920&h=1080&fit=crop',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      category: 'Web Development',
      difficulty: 'Intermediate',
      duration: '12 hours',
      rating: 4.8,
      tags: ['React', 'TypeScript', 'JavaScript', 'Frontend'],
    },
    {
      id: '2',
      title: 'Python for Data Science',
      description: 'Dive deep into data analysis, machine learning, and visualization with Python. Perfect for beginners and professionals looking to advance their careers.',
      backgroundImage: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1920&h=1080&fit=crop',
      category: 'Data Science',
      difficulty: 'Beginner',
      duration: '15 hours',
      rating: 4.9,
      tags: ['Python', 'Data Analysis', 'Machine Learning', 'Pandas'],
    },
    {
      id: '3',
      title: 'Advanced System Design',
      description: 'Learn to design scalable, distributed systems used by top tech companies. Master microservices, databases, and cloud architecture patterns.',
      backgroundImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&h=1080&fit=crop',
      category: 'System Design',
      difficulty: 'Advanced',
      duration: '20 hours',
      rating: 4.7,
      tags: ['Architecture', 'Microservices', 'Cloud', 'Scalability'],
    },
  ];

  // Sample course sections data
  const courseSections: CourseSection[] = [
    {
      id: 'trending',
      title: 'Trending Now',
      subtitle: 'Popular courses this week',
      courses: [
        {
          id: 'course-1',
          title: 'Complete JavaScript Bootcamp',
          description: 'Master JavaScript from basics to advanced concepts with hands-on projects.',
          longDescription: 'This comprehensive JavaScript course covers everything from basic syntax to advanced concepts like closures, promises, and async/await. You\'ll build real-world projects and learn modern ES6+ features.',
          thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=225&fit=crop',
          category: 'Programming',
          difficulty: 'Beginner',
          duration: '10 hours',
          rating: 4.6,
          reviewCount: 1250,
          enrollmentCount: 15420,
          tags: ['JavaScript', 'ES6', 'DOM', 'Async'],
          instructor: {
            name: 'Sarah Johnson',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
            bio: 'Senior Frontend Developer with 8+ years of experience',
            rating: 4.8,
          },
          chapters: [
            { id: '1', title: 'Introduction to JavaScript', duration: '45 min', isPreview: true },
            { id: '2', title: 'Variables and Data Types', duration: '1h 20min' },
            { id: '3', title: 'Functions and Scope', duration: '1h 15min' },
          ],
        },
        {
          id: 'course-2',
          title: 'Machine Learning Fundamentals',
          description: 'Learn the core concepts of machine learning with practical examples.',
          thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=225&fit=crop',
          category: 'AI/ML',
          difficulty: 'Intermediate',
          duration: '14 hours',
          rating: 4.8,
          reviewCount: 890,
          enrollmentCount: 8750,
          tags: ['Machine Learning', 'Python', 'Algorithms'],
          instructor: {
            name: 'Dr. Michael Chen',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
            bio: 'PhD in Computer Science, ML Research Scientist',
            rating: 4.9,
          },
        },
        {
          id: 'course-3',
          title: 'UI/UX Design Masterclass',
          description: 'Create beautiful and user-friendly interfaces with modern design principles.',
          thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=225&fit=crop',
          category: 'Design',
          difficulty: 'Beginner',
          duration: '8 hours',
          rating: 4.7,
          reviewCount: 2100,
          enrollmentCount: 12300,
          tags: ['UI Design', 'UX Research', 'Figma', 'Prototyping'],
          instructor: {
            name: 'Emma Rodriguez',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
            bio: 'Lead UX Designer at top tech company',
            rating: 4.7,
          },
        },
      ],
    },
    {
      id: 'continue-watching',
      title: 'Continue Learning',
      subtitle: 'Pick up where you left off',
      courses: [
        {
          id: 'course-4',
          title: 'Advanced React Patterns',
          description: 'Master advanced React concepts and patterns used in production applications.',
          thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop',
          category: 'Frontend',
          difficulty: 'Advanced',
          duration: '16 hours',
          rating: 4.9,
          reviewCount: 650,
          enrollmentCount: 4200,
          progress: 65,
          tags: ['React', 'Hooks', 'Context', 'Performance'],
          instructor: {
            name: 'Alex Thompson',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
            bio: 'React Core Team Member',
            rating: 4.9,
          },
        },
        {
          id: 'course-5',
          title: 'Node.js Backend Development',
          description: 'Build scalable backend applications with Node.js and Express.',
          thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=225&fit=crop',
          category: 'Backend',
          difficulty: 'Intermediate',
          duration: '12 hours',
          rating: 4.6,
          reviewCount: 980,
          enrollmentCount: 7800,
          progress: 30,
          tags: ['Node.js', 'Express', 'MongoDB', 'API'],
          instructor: {
            name: 'David Kim',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
            bio: 'Senior Backend Engineer',
            rating: 4.7,
          },
        },
      ],
    },
    {
      id: 'recommended',
      title: 'Recommended for You',
      subtitle: 'Based on your learning history',
      courses: [
        {
          id: 'course-6',
          title: 'Cloud Architecture with AWS',
          description: 'Learn to design and deploy scalable applications on Amazon Web Services.',
          thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=225&fit=crop',
          category: 'Cloud Computing',
          difficulty: 'Advanced',
          duration: '18 hours',
          rating: 4.8,
          reviewCount: 720,
          enrollmentCount: 5600,
          tags: ['AWS', 'Cloud', 'DevOps', 'Architecture'],
          instructor: {
            name: 'Jennifer Lee',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
            bio: 'AWS Solutions Architect',
            rating: 4.8,
          },
        },
      ],
    },
  ];

  // Event handlers
  const handleCoursePlay = (courseId: string) => {
    console.log('Playing course:', courseId);
    // Navigate to course player
  };

  const handleCourseEnroll = (courseId: string) => {
    setEnrolledCourses(prev => new Set([...prev, courseId]));
    console.log('Enrolled in course:', courseId);
  };

  const handleAddToWatchlist = (courseId: string) => {
    setWatchlist(prev => new Set([...prev, courseId]));
  };

  const handleRemoveFromWatchlist = (courseId: string) => {
    setWatchlist(prev => {
      const newSet = new Set(prev);
      newSet.delete(courseId);
      return newSet;
    });
  };

  const handleCourseMoreInfo = (courseId: string) => {
    const course = courseSections
      .flatMap(section => section.courses)
      .find(c => c.id === courseId);
    
    if (course) {
      setSelectedCourse(course);
      setIsModalOpen(true);
    }
  };

  const handleHeroSlideClick = (slide: HeroSlide) => {
    // Find corresponding course or create a mock course from slide data
    const mockCourse: Course = {
      id: slide.id,
      title: slide.title,
      description: slide.description,
      thumbnail: slide.backgroundImage,
      videoUrl: slide.videoUrl,
      category: slide.category,
      difficulty: slide.difficulty,
      duration: slide.duration,
      rating: slide.rating,
      reviewCount: 1000,
      enrollmentCount: 5000,
      tags: slide.tags,
      instructor: {
        name: 'Expert Instructor',
        bio: 'Industry expert with years of experience',
        rating: 4.8,
      },
    };
    
    setSelectedCourse(mockCourse);
    setIsModalOpen(true);
  };

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Hero Section */}
      <HeroCarousel
        slides={heroSlides}
        onSlideClick={handleHeroSlideClick}
        onPlayClick={(slide) => handleCoursePlay(slide.id)}
        autoPlay={true}
        autoPlayInterval={6000}
      />

      {/* Main Content */}
      <motion.main
        className="relative z-10 -mt-32 pb-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Quick Stats */}
        <motion.section
          className="container mx-auto px-8 lg:px-16 mb-16"
          variants={sectionVariants}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-background-elevated/80 backdrop-blur-sm border border-border-primary rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-accent-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AcademicCapIcon className="w-6 h-6 text-accent-blue" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">500+</h3>
              <p className="text-text-secondary">Expert-led Courses</p>
            </div>
            
            <div className="bg-background-elevated/80 backdrop-blur-sm border border-border-primary rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-accent-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrophyIcon className="w-6 h-6 text-accent-gold" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">50K+</h3>
              <p className="text-text-secondary">Successful Graduates</p>
            </div>
            
            <div className="bg-background-elevated/80 backdrop-blur-sm border border-border-primary rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-accent-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="w-6 h-6 text-accent-green" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">24/7</h3>
              <p className="text-text-secondary">Learning Support</p>
            </div>
          </div>
        </motion.section>

        {/* Course Sections */}
        {courseSections.map((section, sectionIndex) => (
          <motion.section
            key={section.id}
            className="container mx-auto px-8 lg:px-16 mb-12"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
                  {section.title}
                </h2>
                {section.subtitle && (
                  <p className="text-text-secondary">{section.subtitle}</p>
                )}
              </div>
              
              {section.viewAllLink && (
                <Link
                  to={section.viewAllLink}
                  className="flex items-center gap-2 text-text-primary hover:text-netflix-red transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-border-focus rounded"
                >
                  <span>View All</span>
                  <ChevronRightIcon className="w-4 h-4" />
                </Link>
              )}
            </div>

            {/* Course Cards */}
            <PosterCardRow className="gap-4">
              {section.courses.map((course) => (
                <PosterCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  thumbnail={course.thumbnail}
                  category={course.category}
                  difficulty={course.difficulty}
                  duration={course.duration}
                  rating={course.rating}
                  progress={course.progress}
                  isCompleted={course.isCompleted}
                  isInWatchlist={watchlist.has(course.id)}
                  tags={course.tags}
                  instructor={course.instructor.name}
                  enrollmentCount={course.enrollmentCount}
                  onPlay={handleCoursePlay}
                  onAddToWatchlist={handleAddToWatchlist}
                  onRemoveFromWatchlist={handleRemoveFromWatchlist}
                  onMoreInfo={handleCourseMoreInfo}
                  size="medium"
                  showProgress={section.id === 'continue-watching'}
                  className="flex-shrink-0"
                />
              ))}
            </PosterCardRow>
          </motion.section>
        ))}

        {/* Call to Action */}
        <motion.section
          className="container mx-auto px-8 lg:px-16 mt-20"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="bg-netflix-gradient rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Join thousands of students already learning with our expert-led courses.
              Start your journey today.
            </p>
            <Link
              to="/courses"
              className="netflix-button text-lg px-8 py-4 font-semibold transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-netflix-red inline-block"
            >
              Browse All Courses
            </Link>
          </div>
        </motion.section>
      </motion.main>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <ModalTrailer
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCourse(null);
          }}
          courseId={selectedCourse.id}
          title={selectedCourse.title}
          description={selectedCourse.description}
          longDescription={selectedCourse.longDescription}
          videoUrl={selectedCourse.videoUrl}
          thumbnailUrl={selectedCourse.thumbnail}
          category={selectedCourse.category}
          difficulty={selectedCourse.difficulty}
          duration={selectedCourse.duration}
          rating={selectedCourse.rating}
          reviewCount={selectedCourse.reviewCount}
          enrollmentCount={selectedCourse.enrollmentCount}
          instructor={selectedCourse.instructor}
          tags={selectedCourse.tags}
          chapters={selectedCourse.chapters}
          isInWatchlist={watchlist.has(selectedCourse.id)}
          isEnrolled={enrolledCourses.has(selectedCourse.id)}
          onPlay={handleCoursePlay}
          onEnroll={handleCourseEnroll}
          onAddToWatchlist={handleAddToWatchlist}
          onRemoveFromWatchlist={handleRemoveFromWatchlist}
        />
      )}
    </div>
  );
};

export default Homepage;