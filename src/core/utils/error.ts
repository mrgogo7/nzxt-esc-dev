/**
 * Centralized error logging utility.
 */
export const Logger = {
  error: (context: string, message: string, error?: unknown) => {
    console.error(`[ERROR][${context}] ${message}`, error);
  },
  warn: (context: string, message: string) => {
    console.warn(`[WARN][${context}] ${message}`);
  },
  info: (context: string, message: string) => {
    console.log(`[INFO][${context}] ${message}`);
  }
};

/**
 * Executes an operation and logs errors if it fails.
 */
export async function withErrorHandling<T>(
  context: string,
  operation: () => Promise<T>,
  fallbackValue: T
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    Logger.error(context, 'Operation failed, using fallback.', error);
    return fallbackValue;
  }
}
