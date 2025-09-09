import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Content } from '@/types';
import { useContent } from '@/hooks/useApi';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  ArrowLeftIcon, 
  ClockIcon, 
  TagIcon, 
  UserIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const LessonDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isCompleted, setIsCompleted] = useState(false);

  // Use React Query hooks
  const { data: content, isLoading: loading, error } = useContent.getContentDetail(parseInt(id || '0'));
  const { mutate: markComplete, isPending: completing } = useContent.markComplete();

  // Handle error case
  if (error) {
    navigate('/');
    return null;
  }

  const handleMarkComplete = () => {
    if (!content || completing) return;

    markComplete(content.id, {
      onSuccess: () => {
        setIsCompleted(true);
        toast.success('Lesson marked as complete! 🎉');
      },
      onError: () => {
        toast.error('Failed to mark lesson as complete.');
      }
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
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

  const renderContentData = (contentData: any) => {
    if (!contentData) return null;

    // Handle different content types
    if (typeof contentData === 'string') {
      return (
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: contentData }}
        />
      );
    }

    // Handle structured content
    if (contentData.sections) {
      return (
        <div className="space-y-8">
          {contentData.sections.map((section: any, index: number) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border">
              {section.title && (
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {section.title}
                </h3>
              )}
              {section.content && (
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              )}
              {section.code && (
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mt-4">
                  <code>{section.code}</code>
                </pre>
              )}
            </div>
          ))}
        </div>
      );
    }

    // Fallback for other content structures
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <pre className="whitespace-pre-wrap text-gray-700">
          {JSON.stringify(contentData, null, 2)}
        </pre>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lesson not found</h2>
          <p className="text-gray-600 mb-4">The lesson you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {content.title}
              </h1>
              <p className="text-gray-600 text-lg">
                {content.description}
              </p>
            </div>
            
            {!isCompleted && (
              <button
                onClick={handleMarkComplete}
                disabled={completing}
                className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {completing ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                )}
                Mark Complete
              </button>
            )}
            
            {isCompleted && (
              <div className="flex items-center text-green-600">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Completed
              </div>
            )}
          </div>

          {/* Meta information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center">
              <UserIcon className="h-4 w-4 mr-1" />
              {content.author.first_name} {content.author.last_name}
            </div>
            
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              {content.estimated_duration} min read
            </div>
            
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(content.difficulty)}`}>
              {content.difficulty}
            </span>
            
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {content.category}
            </span>
            
            <span className="text-xs">
              {format(new Date(content.created_at), 'MMM dd, yyyy')}
            </span>
          </div>

          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <div className="mt-4 flex items-center gap-2">
              <TagIcon className="h-4 w-4 text-gray-400" />
              <div className="flex flex-wrap gap-2">
                {content.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mb-8">
        {renderContentData(content.content_data)}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center bg-white rounded-lg shadow-sm border p-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Home
        </button>
        
        {!isCompleted && (
          <button
            onClick={handleMarkComplete}
            disabled={completing}
            className="flex items-center bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {completing ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <CheckCircleIcon className="h-5 w-5 mr-2" />
            )}
            Complete Lesson
          </button>
        )}
      </div>
    </div>
  );
};

export default LessonDetail;