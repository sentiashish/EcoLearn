import { useState, useEffect, useCallback } from 'react';  // Remove React import
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { toast } from 'react-hot-toast';

// Add these interfaces at the top of the file, after the imports
interface Example {
  input: string;
  output: string;
  explanation?: string;
}

interface Hint {
  title: string;
  content: string;
}

interface Submission {
  id: number;
  user: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  feedback?: string;
  score?: number;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  examples?: Example[];
  hints?: Hint[];
  submissions?: Submission[];
  // Add other properties as needed
}


// Add the missing API_BASE_URL constant
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Auth hooks
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiService.login,
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user);
      toast.success('Login successful!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiService.register,
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user);
      toast.success('Registration successful!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });
};

// User hooks
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: apiService.getUserProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiService.updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      toast.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });
};

// Content hooks - Fix the queryFn parameter issue
export const useLessons = (params?: { page?: number; difficulty?: string; search?: string }) => {
  return useQuery({
    queryKey: ['lessons', params],
    queryFn: () => apiService.getContent(params), // Keep the arrow function
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useLesson = (id: number) => {
  return useQuery({
    queryKey: ['lesson', id],
    queryFn: () => apiService.getContentDetail(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCompleteLesson = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, timeSpent }: { id: number; timeSpent: number }) => 
      apiService.markContentComplete(id, timeSpent),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lesson', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      
      if (data.points_earned) {
        toast.success(`Lesson completed! +${data.points_earned} points`);
      }
      
      if (data.badges_unlocked?.length > 0) {
        data.badges_unlocked.forEach((badge: any) => {
          toast.success(`🎉 Badge unlocked: ${badge.name}`);
        });
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to complete lesson');
    },
  });
};

// Quiz hooks
export const useQuiz = (id: number) => {
  return useQuery({
    queryKey: ['quiz', id],
    queryFn: () => apiService.getQuiz(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useSubmitQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, answers, timeTaken }: { id: number; answers: any[]; timeTaken: number }) => 
      apiService.submitQuiz(id, answers, timeTaken),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quiz', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      
      if (data.passed) {
        toast.success(`Quiz passed! Score: ${data.score}% (+${data.points_earned} points)`);
      } else {
        toast.error(`Quiz failed. Score: ${data.score}%. Try again!`);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit quiz');
    },
  });
};

// Challenge hooks
export const useChallenges = () => {
  return useQuery({
    queryKey: ['challenges'],
    queryFn: apiService.getChallenges,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useChallenge = (id: number) => {
  return useQuery({
    queryKey: ['challenge', id],
    queryFn: () => apiService.getChallengeDetail(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSubmitChallenge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) => 
      apiService.submitChallenge(id, formData),
    onSuccess: (_data, variables) => { // Fix: add underscore to unused parameter
      queryClient.invalidateQueries({ queryKey: ['challenge', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['challenge-submissions'] });
      
      toast.success('Challenge submitted successfully! Awaiting review.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit challenge');
    },
  });
};

export const useChallengeSubmissions = () => {
  return useQuery({
    queryKey: ['challenge-submissions'],
    queryFn: apiService.getChallengeSubmissions,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Challenge Data hooks (NEW)
export const useChallengeData = () => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching challenges from:', `${API_BASE_URL}/challenges/challenge-data/`);
      
      const response = await apiService.getChallengeData();
      console.log('Raw API response:', response);
      
      // Handle both paginated and non-paginated responses
      const challengeData = response.results || response || [];
      console.log('Processed challenge data:', challengeData);
      
      setChallenges(challengeData);
    } catch (err: any) {
      console.error('Detailed error:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          err.message || 
                          'Failed to fetch challenges';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  return { challenges, loading, error, refetch: fetchChallenges };
};

export const useChallengeSubmissionData = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [bestScores, setBestScores] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSubmission = useCallback(async (data: {
    challenge_id: number;
    score: number;
    is_completed: boolean;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.createChallengeSubmission(data);
      await fetchBestScores(); // Refresh best scores
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create submission');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBestScores = useCallback(async () => {
    try {
      const response = await apiService.getUserBestScores();
      setBestScores(response);
    } catch (err: any) {
      console.error('Error fetching best scores:', err);
    }
  }, []);

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserChallengeSubmissions();
      setSubmissions(response.results || response);
      await fetchBestScores();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  }, [fetchBestScores]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  return { 
    submissions, 
    bestScores, 
    loading, 
    error, 
    createSubmission, 
    refetch: fetchSubmissions 
  };
};

// Gamification hooks - Fix the type issue with period parameter
export const useLeaderboard = (params?: { 
  scope?: string; 
  period?: 'week' | 'month' | 'all'; // Fix: restrict to specific string literals
  page?: number; 
}) => {
  return useQuery({
    queryKey: ['leaderboard', params],
    queryFn: () => apiService.getLeaderboard(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useBadges = () => {
  return useQuery({
    queryKey: ['badges'],
    queryFn: apiService.getBadges,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePointsHistory = () => {
  return useQuery({
    queryKey: ['points-history'],
    queryFn: apiService.getPointsHistory,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Teacher hooks
export const usePendingSubmissions = () => {
  return useQuery({
    queryKey: ['pending-submissions'],
    queryFn: apiService.getPendingSubmissions,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useReviewSubmission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status, feedback }: { id: number; status: 'approved' | 'rejected'; feedback: string }) => 
      apiService.reviewSubmission(id, status, feedback),
    onSuccess: (_data, variables) => { // Fix: add underscore to unused parameter
      queryClient.invalidateQueries({ queryKey: ['pending-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['challenge-submissions'] });
      
      const action = variables.status === 'approved' ? 'approved' : 'rejected';
      toast.success(`Submission ${action} successfully!`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to review submission');
    },
  });
};

// Alias exports for backward compatibility
export const useContent = useLessons;
export const useUser = useUserProfile;
export const useGamification = useLeaderboard;
export const useAuthApi = () => ({
  login: useLogin(),
  register: useRegister(),
});
export const useAuth = () => ({
  login: useLogin(),
  register: useRegister(),
  user: useUserProfile(),
});
export const useProgress = usePointsHistory;
export const useAchievements = useBadges;
export const useSubmissions = useChallengeSubmissions;
export const useAdmin = () => ({
  pendingSubmissions: usePendingSubmissions(),
  reviewSubmission: useReviewSubmission(),
});