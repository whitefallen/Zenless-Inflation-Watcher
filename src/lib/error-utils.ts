/**
 * Error handling utilities for the application
 */

/**
 * Logger utility that only logs in development
 */
export const logger = {
  info: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  
  error: (message: string, error?: unknown, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ERROR] ${message}`, error, ...args);
    }
    // In production, you could send to an error tracking service like Sentry
  },
  
  debug: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
};

/**
 * Error boundary data for displaying user-friendly error messages
 */
export interface ErrorInfo {
  title: string;
  message: string;
  action?: string;
}

/**
 * Maps common error types to user-friendly messages
 */
export function getErrorInfo(error: unknown): ErrorInfo {
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return {
        title: 'Connection Error',
        message: 'Unable to load data. Please check your internet connection and try again.',
        action: 'Retry'
      };
    }
    
    // File not found errors
    if (error.message.includes('ENOENT') || error.message.includes('not found')) {
      return {
        title: 'Data Not Found',
        message: 'The requested data could not be found. It may not have been collected yet.',
        action: 'Go Back'
      };
    }
    
    // Parsing errors
    if (error.message.includes('JSON') || error.message.includes('parse')) {
      return {
        title: 'Data Format Error',
        message: 'The data format is invalid. This may be due to corrupted files.',
        action: 'Report Issue'
      };
    }
  }
  
  // Generic error
  return {
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try again later.',
    action: 'Retry'
  };
}

/**
 * Safely executes an async function and returns result or error
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    logger.error('Operation failed', error);
    return fallback;
  }
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    onRetry?: (attempt: number, error: unknown) => void;
  } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, onRetry } = options;
  
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        onRetry?.(attempt + 1, error);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}
