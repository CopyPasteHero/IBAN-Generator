// Consistent logging utility for development and production environments
class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  /**
   * Log warning messages only in development environment
   */
  warn(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.warn(message, ...args);
    }
  }

  /**
   * Log error messages (shown in both development and production)
   */
  error(message: string, ...args: any[]): void {
    console.error(message, ...args);
  }

  /**
   * Log info messages only in development environment
   */
  info(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.info(message, ...args);
    }
  }

  /**
   * Log debug messages only in development environment
   */
  debug(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.debug(message, ...args);
    }
  }
}

// Export a singleton instance
export const logger = new Logger();