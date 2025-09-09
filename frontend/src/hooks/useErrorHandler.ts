import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { ApiException } from '../services/api';

export const useErrorHandler = () => {
  const handleError = useCallback((error: unknown, defaultMessage = 'An error occurred') => {
    console.error('Error:', error);

    if (error instanceof ApiException) {
      // Handle API errors with specific status codes
      switch (error.status) {
        case 400:
          toast.error(error.message || 'Invalid request data');
          break;
        case 401:
          toast.error('Please log in to continue');
          break;
        case 403:
          toast.error('You do not have permission to perform this action');
          break;
        case 404:
          toast.error('The requested resource was not found');
          break;
        case 429:
          toast.error('Too many requests. Please try again later');
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          toast.error('Server error. Please try again later');
          break;
        default:
          toast.error(error.message || defaultMessage);
      }
      return error;
    }

    if (error instanceof Error) {
      // Handle regular JavaScript errors
      if (error.message.includes('Network Error') || error.message.includes('fetch')) {
        toast.error('Network error. Please check your internet connection');
      } else {
        toast.error(error.message || defaultMessage);
      }
      return error;
    }

    // Handle unknown errors
    toast.error(defaultMessage);
    return new Error(defaultMessage);
  }, []);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    errorMessage?: string
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, errorMessage);
      return null;
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
  };
};

export default useErrorHandler;