/**
 * Configuration for retry operations
 */
interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,  // Start with 1 second delay
  maxDelayMs: 10000,     // Max 10 seconds delay
  backoffFactor: 2       // Double the delay each time
};

/**
 * List of error codes/messages that indicate we should retry
 */
const RETRYABLE_ERRORS = [
  'rate_limit_exceeded',
  'timeout',
  'server_error',
  '429',  // Too Many Requests
  '500',  // Internal Server Error
  '502',  // Bad Gateway
  '503',  // Service Unavailable
  '504',  // Gateway Timeout
  'Connection reset by peer',
  'ECONNRESET',
  'ETIMEDOUT',
  'ESOCKETTIMEDOUT'
];

/**
 * Sleep for specified milliseconds
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check if an error is retryable
 */
function isRetryableError(error: any): boolean {
  const errorString = error?.toString()?.toLowerCase() || '';
  const errorCode = error?.response?.status?.toString() || '';
  const errorMessage = error?.message?.toLowerCase() || '';

  return RETRYABLE_ERRORS.some(retryableError => 
    errorString.includes(retryableError.toLowerCase()) ||
    errorCode.includes(retryableError) ||
    errorMessage.includes(retryableError.toLowerCase())
  );
}

/**
 * Retry an async operation with exponential backoff
 * @param operation The async operation to retry
 * @param config Retry configuration
 * @returns The result of the operation
 * @throws The last error encountered if all retries fail
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: any;
  let delay = retryConfig.initialDelayMs;

  for (let attempt = 1; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // If it's not a retryable error, throw immediately
      if (!isRetryableError(error)) {
        console.error('Non-retryable error encountered:', error);
        throw error;
      }

      // If it's the last attempt, throw the error
      if (attempt === retryConfig.maxRetries) {
        console.error(`All retry attempts failed (${retryConfig.maxRetries} attempts):`, error);
        throw error;
      }

      // Log retry attempt
      console.warn(
        `OpenAI operation failed (attempt ${attempt}/${retryConfig.maxRetries}). ` +
        `Retrying in ${delay}ms...`,
        error
      );

      // Wait before retrying
      await sleep(delay);

      // Increase delay for next attempt (with max limit)
      delay = Math.min(delay * retryConfig.backoffFactor, retryConfig.maxDelayMs);
    }
  }

  throw lastError;
} 