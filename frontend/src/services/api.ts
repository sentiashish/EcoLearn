import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Error handling utility
interface ApiError {
  message: string;
  status?: number;
  field?: string;
}

export class ApiException extends Error {
  public status?: number;
  public field?: string;

  constructor(message: string, status?: number, field?: string) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.field = field;
  }
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
        baseURL: API_BASE_URL,
        timeout: 10000, // 10 seconds timeout
        headers: {
          'Content-Type': 'application/json',
        },
      });

    this.setupInterceptors();
  }

  // Utility method to extract error information
  private extractErrorInfo(error: any): ApiError {
    if (error.response) {
      const { status, data } = error.response;
      
      if (data.detail) {
        return { message: data.detail, status };
      }
      
      if (data.non_field_errors) {
        return { message: data.non_field_errors[0], status };
      }
      
      // Handle field-specific errors
      const fieldErrors = Object.entries(data);
      if (fieldErrors.length > 0) {
        const [field, messages] = fieldErrors[0];
        const message = Array.isArray(messages) ? messages[0] : messages;
        return { message: message as string, status, field };
      }
      
      return { message: 'An error occurred', status };
    }
    
    if (error.message) {
      return { message: error.message };
    }
    
    return { message: 'An unexpected error occurred' };
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        // Handle network errors
        if (!error.response) {
          if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
            toast.error('Network error. Please check your internet connection.');
          } else if (error.code === 'ECONNABORTED') {
            toast.error('Request timeout. Please try again.');
          }
        }

        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
                refresh: refreshToken,
              });

              const { access } = response.data;
              localStorage.setItem('access_token', access);

              // Retry the original request with new token
              originalRequest.headers.Authorization = `Bearer ${access}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        // Handle other errors
        if (error.response?.status >= 500) {
          toast.error('Server error. Please try again later.');
        } else if (error.response?.status === 403) {
          toast.error('You do not have permission to perform this action.');
        } else if (error.response?.status === 404) {
          toast.error('The requested resource was not found.');
        } else if (error.response?.status === 400) {
          // Handle validation errors
          const errorData = error.response.data;
          if (errorData.detail) {
            toast.error(errorData.detail);
          } else if (errorData.non_field_errors) {
            toast.error(errorData.non_field_errors[0]);
          } else {
            // Handle field-specific errors
            const fieldErrors = Object.values(errorData).flat();
            if (fieldErrors.length > 0) {
              toast.error(fieldErrors[0] as string);
            } else {
              toast.error('Invalid data provided.');
            }
          }
        } else if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else if (error.message) {
          toast.error(error.message);
        } else {
          toast.error('An unexpected error occurred.');
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(credentials: { email: string; password: string }) {
    const response = await this.api.post('/auth/login/', credentials);
    return response.data;
  }

  async register(userData: {
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    role: 'student' | 'teacher';
  }) {
    const response = await this.api.post('/auth/register/', userData);
    return response.data;
  }

  async logout() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await this.api.post('/auth/refresh/', { refresh: refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  async getCurrentUser() {
    try {
      const response = await this.api.get('/users/me/');
      return response.data;
    } catch (error) {
      const errorInfo = this.extractErrorInfo(error);
      throw new ApiException(errorInfo.message, errorInfo.status, errorInfo.field);
    }
  }

  async getUserStats() {
    try {
      const response = await this.api.get('/users/stats/');
      return response.data;
    } catch (error) {
      const errorInfo = this.extractErrorInfo(error);
      throw new ApiException(errorInfo.message, errorInfo.status, errorInfo.field);
    }
  }

  // Content methods
  async getContent(params?: { page?: number; difficulty?: string; search?: string }) {
    const response = await this.api.get('/content/lessons/', { params });
    return response.data;
  }

  async getContentDetail(id: number) {
    const response = await this.api.get(`/content/lessons/${id}/`);
    return response.data;
  }

  async markContentComplete(id: number, timeSpent: number) {
    const response = await this.api.post(`/content/lessons/${id}/complete/`, { time_spent: timeSpent });
    return response.data;
  }

  // Challenge methods
  async getChallenges(params?: { difficulty?: string; page?: number }) {
    const response = await this.api.get('/challenges/challenges/', { params });
    return response.data;
  }

  async getChallengeDetail(id: number) {
    const response = await this.api.get(`/challenges/challenges/${id}/`);
    return response.data;
  }

  async submitChallenge(id: number, formData: FormData) {
    const response = await this.api.post(`/challenges/challenges/${id}/submit/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getChallengeSubmissions() {
    const response = await this.api.get('/challenges/submissions/');
    return response.data;
  }

  // Carbon Footprint methods
  async createCarbonFootprint(data: any) {
    const response = await this.api.post('/challenges/carbon-footprint/', data);
    return response.data;
  }

  async getCarbonFootprintHistory() {
    const response = await this.api.get('/challenges/carbon-footprint/history/');
    return response.data;
  }

  async getLatestCarbonFootprint() {
    const response = await this.api.get('/challenges/carbon-footprint/latest/');
    return response.data;
  }

  async getCarbonFootprintStatistics() {
    const response = await this.api.get('/challenges/carbon-footprint/statistics/');
    return response.data;
  }

  // Gamification methods
  async getUserProgress() {
    const response = await this.api.get('/gamification/progress/');
    return response.data;
  }

  async getUserAchievements() {
    const response = await this.api.get('/gamification/achievements/');
    return response.data;
  }

  // Quiz methods
  async getQuiz(id: number) {
    const response = await this.api.get(`/content/quizzes/${id}/`);
    return response.data;
  }

  async submitQuiz(id: number, answers: any[], timeTaken: number) {
    const response = await this.api.post(`/content/quizzes/${id}/submit/`, {
      answers,
      time_taken: timeTaken,
    });
    return response.data;
  }

  // User methods
  async getUserProfile() {
    const response = await this.api.get('/users/profile/');
    return response.data;
  }

  async updateUserProfile(profileData: any) {
    try {
      const response = await this.api.patch('/users/profile/', profileData);
      return response.data;
    } catch (error) {
      const errorInfo = this.extractErrorInfo(error);
      throw new ApiException(errorInfo.message, errorInfo.status, errorInfo.field);
    }
  }

  async getLeaderboard(params?: { scope?: string; period?: 'week' | 'month' | 'all'; page?: number }) {
    const response = await this.api.get('/gamification/leaderboard/', { params });
    return response.data;
  }

  async getBadges() {
    const response = await this.api.get('/gamification/badges/');
    return response.data;
  }

  async getPointsHistory() {
    const response = await this.api.get('/gamification/points/history/');
    return response.data;
  }

  // Teacher methods
  async getPendingSubmissions() {
    const response = await this.api.get('/teacher/submissions/pending/');
    return response.data;
  }

  async reviewSubmission(id: number, status: 'approved' | 'rejected', feedback: string) {
    const response = await this.api.post(`/teacher/submissions/${id}/review/`, {
      status,
      feedback,
    });
    return response.data;
  }

  // Generic methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.get(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.post(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.put(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.delete(url, config);
  }
}

export const apiService = new ApiService();
export default apiService;