import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChallenge, useChallengeSubmissions, useSubmitChallenge } from '@/hooks/useApi';
import LoadingSpinner from '@/components/LoadingSpinner';
import CarbonFootprintCalculator from '@/components/CarbonFootprintCalculator';
import { 
  ArrowLeftIcon, 
  PlayIcon, 
  ClockIcon, 
  TrophyIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const ChallengeSubmit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [activeTab, setActiveTab] = useState<'problem' | 'submissions'>('problem');

  const languages = [
    { value: 'python', label: 'Python' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
  ];

  // Use React Query hooks
  const { data: challenge, isLoading: challengeLoading, error: challengeError } = useChallenge(parseInt(id || '0'));
  const { data: submissionsData, isLoading: submissionsLoading } = useChallengeSubmissions();
  const { mutate: submitChallenge, isPending: submitting } = useSubmitChallenge();

  const loading = challengeLoading || submissionsLoading;
  const submissions = submissionsData?.results || [];

  // Handle error case
  if (challengeError) {
    navigate('/');
    return null;
  }

  // Set default code template when language changes
  React.useEffect(() => {
    setDefaultCode(language);
  }, [language]);

  const setDefaultCode = (selectedLanguage: string) => {
    const templates: Record<string, string> = {
      python: '# Write your solution here\ndef solution():\n    pass\n\n# Test your solution\nif __name__ == "__main__":\n    print(solution())',
      javascript: '// Write your solution here\nfunction solution() {\n    // Your code here\n}\n\n// Test your solution\nconsole.log(solution());',
      java: 'public class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}',
      cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}',
      c: '#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}',
    };
    
    setCode(templates[selectedLanguage] || '');
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    if (!code.trim()) {
      setDefaultCode(newLanguage);
    }
  };

  const handleSubmit = () => {
    if (!challenge || !code.trim()) {
      toast.error('Please write some code before submitting.');
      return;
    }

    const formData = new FormData();
    formData.append('code', code);
    formData.append('language', language);

    submitChallenge(
      {
        id: challenge.id,
        formData,
      },
      {
        onSuccess: () => {
          toast.success('Code submitted successfully! 🚀');
          setActiveTab('submissions');
        },
        onError: (error: any) => {
          const errorMessage = error.response?.data?.message || 'Failed to submit code. Please try again.';
          toast.error(errorMessage);
        },
      }
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'wrong_answer':
      case 'compilation_error':
      case 'runtime_error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'time_limit_exceeded':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'pending':
      case 'running':
        return <LoadingSpinner size="sm" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'text-green-600 bg-green-50';
      case 'wrong_answer':
      case 'compilation_error':
      case 'runtime_error':
        return 'text-red-600 bg-red-50';
      case 'time_limit_exceeded':
        return 'text-yellow-600 bg-yellow-50';
      case 'pending':
      case 'running':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Challenge not found</h2>
          <p className="text-gray-600 mb-4">The challenge you're looking for doesn't exist.</p>
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

  // Special case for Carbon Footprint Calculator (Challenge ID 1)
  if (parseInt(id || '0') === 1) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back
          </button>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Carbon Footprint Calculator
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Easy
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Climate
                  </span>
                  <div className="flex items-center">
                    <TrophyIcon className="h-4 w-4 mr-1" />
                    100 eco-points
                  </div>
                </div>
              </div>
            </div>
            <p className="text-gray-600">
              Calculate your daily carbon emissions based on transportation, energy use, and consumption habits. 
              Use this tool to understand your environmental impact and find ways to reduce it.
            </p>
          </div>
        </div>

        {/* Carbon Footprint Calculator Component */}
        <CarbonFootprintCalculator />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {challenge.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                  {challenge.difficulty}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  {challenge.category}
                </span>
                <div className="flex items-center">
                  <TrophyIcon className="h-4 w-4 mr-1" />
                  {challenge.points} eco-points
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Problem Description */}
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('problem')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'problem'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Problem
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'submissions'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Submissions ({submissions.length})
              </button>
            </nav>
          </div>

          {activeTab === 'problem' ? (
            <div className="space-y-6">
              {/* Problem Statement */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Problem Statement</h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{challenge.problem_statement}</p>
                </div>
              </div>

              {/* Examples */}
              {challenge.examples && challenge.examples.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Examples</h3>
                  <div className="space-y-4">
                    {challenge.examples.map((example, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Example {index + 1}</h4>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium text-gray-500">Input:</span>
                            <pre className="bg-gray-50 p-2 rounded text-sm mt-1">{example.input}</pre>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Output:</span>
                            <pre className="bg-gray-50 p-2 rounded text-sm mt-1">{example.output}</pre>
                          </div>
                          {example.explanation && (
                            <div>
                              <span className="text-sm font-medium text-gray-500">Explanation:</span>
                              <p className="text-sm text-gray-700 mt-1">{example.explanation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hints */}
              {challenge.hints && challenge.hints.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Hints</h3>
                  <div className="space-y-2">
                    {challenge.hints.map((hint, index) => (
                      <div key={index} className="flex items-start">
                        <span className="text-sm font-medium text-gray-500 mr-2">{index + 1}.</span>
                        <p className="text-sm text-gray-700">{hint}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Submissions</h3>
              {submissions.length > 0 ? (
                <div className="space-y-3">
                  {submissions.map((submission) => (
                    <div key={submission.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(submission.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                            {submission.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500">{submission.language}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {format(new Date(submission.submitted_at), 'MMM dd, HH:mm')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Score: {submission.score}/100</span>
                        {submission.execution_time && (
                          <span>Time: {submission.execution_time}ms</span>
                        )}
                        {submission.memory_used && (
                          <span>Memory: {submission.memory_used}KB</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No submissions yet. Submit your first solution!</p>
              )}
            </div>
          )}
        </div>

        {/* Right Panel - Code Editor */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Code Editor</h3>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
            
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Write your solution here..."
              spellCheck={false}
            />
            
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Press Ctrl+Enter to submit
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting || !code.trim()}
                className="flex items-center bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <PlayIcon className="h-5 w-5 mr-2" />
                )}
                {submitting ? 'Submitting...' : 'Submit Solution'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeSubmit;