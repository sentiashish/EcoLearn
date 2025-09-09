import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { toast } from 'react-hot-toast';

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

// Content hooks
export const useLessons = (params?: { page?: number; difficulty?: string; search?: string }) => {
  return useQuery({
    queryKey: ['lessons', params],
    queryFn: () => apiService.getContent(params),
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
    onSuccess: (data, variables) => {
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

// Gamification hooks
export const useLeaderboard = (params?: { scope?: string; period?: string; page?: number }) => {
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
    onSuccess: (data, variables) => {
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