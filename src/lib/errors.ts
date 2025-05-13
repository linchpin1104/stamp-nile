/**
 * Custom error classes for better error handling
 */

// Base application error class
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'APP_ERROR',
    public readonly httpStatus: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
    // Maintain proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        code: this.code,
        message: this.message,
        httpStatus: this.httpStatus,
      }
    };
  }
}

// Database errors
export class DatabaseError extends AppError {
  constructor(message: string, code: string = 'DATABASE_ERROR', httpStatus: number = 500) {
    super(message, code, httpStatus);
  }
}

export class DocumentNotFoundError extends AppError {
  constructor(documentType: string, id: string) {
    super(
      `${documentType} with id '${id}' not found`, 
      'DOCUMENT_NOT_FOUND', 
      404
    );
  }
}

// Validation errors
export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly field?: string,
    code: string = 'VALIDATION_ERROR'
  ) {
    super(message, code, 400);
  }

  toJSON() {
    return {
      error: {
        ...super.toJSON().error,
        field: this.field
      }
    };
  }
}

// Auth errors
export class AuthError extends AppError {
  constructor(message: string, code: string = 'AUTH_ERROR', httpStatus: number = 401) {
    super(message, code, httpStatus);
  }
}

export class PermissionDeniedError extends AppError {
  constructor(message: string = 'You do not have permission to perform this action') {
    super(message, 'PERMISSION_DENIED', 403);
  }
}

// Network errors
export class NetworkError extends AppError {
  constructor(message: string, code: string = 'NETWORK_ERROR', httpStatus: number = 500) {
    super(message, code, httpStatus);
  }
}

// Error handling utility functions
export function handleError(error: unknown): { message: string; code: string; httpStatus: number } {
  console.error('Error caught:', error);
  
  // Known application errors
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      httpStatus: error.httpStatus
    };
  }
  
  // Standard JavaScript Error object
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNEXPECTED_ERROR',
      httpStatus: 500
    };
  }
  
  // Unknown errors (might be string, object, etc.)
  return {
    message: typeof error === 'string' ? error : 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    httpStatus: 500
  };
}

// Log error utility
export function logError(
  error: unknown, 
  context?: Record<string, unknown>,
  shouldThrow: boolean = false
): void {
  const errorDetails = handleError(error);
  
  // Add timestamp and context to error log
  const logEntry = {
    timestamp: new Date().toISOString(),
    ...errorDetails,
    ...(context ? { context } : {})
  };
  
  // In a real app, would use a proper logging service
  console.error('Application error:', JSON.stringify(logEntry, null, 2));
  
  // Optionally rethrow the error
  if (shouldThrow) {
    throw error instanceof AppError ? error : new AppError(errorDetails.message, errorDetails.code);
  }
} 