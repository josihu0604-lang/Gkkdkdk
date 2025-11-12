/**
 * Structured Logging System
 * 
 * Features:
 * - Log levels (DEBUG, INFO, WARN, ERROR, FATAL)
 * - Structured data (JSON format)
 * - Context tracking (request ID, user ID, etc.)
 * - Performance timing
 * - Error stack traces
 * - Environment-aware (dev/prod)
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

interface LogContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  traceId?: string;
  [key: string]: any;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  data?: any;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  performance?: {
    duration: number;
    startTime: number;
  };
}

class Logger {
  private minLevel: LogLevel;
  private globalContext: LogContext = {};
  
  constructor(minLevel: LogLevel = LogLevel.INFO) {
    // Set minimum log level based on environment
    if (process.env.NODE_ENV === 'development') {
      this.minLevel = LogLevel.DEBUG;
    } else if (process.env.NODE_ENV === 'test') {
      this.minLevel = LogLevel.WARN;
    } else {
      this.minLevel = minLevel;
    }
  }
  
  /**
   * Set global context (applied to all log entries)
   */
  setContext(context: LogContext): void {
    this.globalContext = { ...this.globalContext, ...context };
  }
  
  /**
   * Clear global context
   */
  clearContext(): void {
    this.globalContext = {};
  }
  
  /**
   * DEBUG level log
   */
  debug(message: string, data?: any, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, data, context);
  }
  
  /**
   * INFO level log
   */
  info(message: string, data?: any, context?: LogContext): void {
    this.log(LogLevel.INFO, message, data, context);
  }
  
  /**
   * WARN level log
   */
  warn(message: string, data?: any, context?: LogContext): void {
    this.log(LogLevel.WARN, message, data, context);
  }
  
  /**
   * ERROR level log
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorData = error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : { message: String(error) };
    
    this.log(LogLevel.ERROR, message, errorData, context);
  }
  
  /**
   * FATAL level log (application-breaking errors)
   */
  fatal(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorData = error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : { message: String(error) };
    
    this.log(LogLevel.FATAL, message, errorData, context);
  }
  
  /**
   * Log with performance timing
   */
  withTiming(level: LogLevel, message: string, startTime: number, data?: any, context?: LogContext): void {
    const duration = Date.now() - startTime;
    this.log(level, message, data, context, { duration, startTime });
  }
  
  /**
   * Internal log method
   */
  private log(
    level: LogLevel,
    message: string,
    data?: any,
    context?: LogContext,
    performance?: { duration: number; startTime: number }
  ): void {
    // Skip if below minimum level
    if (level < this.minLevel) {
      return;
    }
    
    // Build log entry
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: { ...this.globalContext, ...context },
      data,
      performance,
    };
    
    // If data is an error-like object, extract it
    if (data && typeof data === 'object' && 'name' in data && 'message' in data) {
      entry.error = {
        name: data.name,
        message: data.message,
        stack: data.stack,
      };
      delete entry.data;
    }
    
    // Output based on environment
    if (process.env.NODE_ENV === 'development') {
      this.consoleLog(entry);
    } else {
      this.structuredLog(entry);
    }
  }
  
  /**
   * Console output for development (pretty-printed)
   */
  private consoleLog(entry: LogEntry): void {
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];
    const levelColors = [
      '\x1b[36m', // cyan
      '\x1b[32m', // green
      '\x1b[33m', // yellow
      '\x1b[31m', // red
      '\x1b[35m', // magenta
    ];
    const reset = '\x1b[0m';
    
    const levelName = levelNames[entry.level];
    const color = levelColors[entry.level];
    
    const prefix = `${color}[${levelName}]${reset} ${entry.timestamp}`;
    
    // Main message
    console.log(`${prefix} ${entry.message}`);
    
    // Context
    if (entry.context && Object.keys(entry.context).length > 0) {
      console.log('  Context:', entry.context);
    }
    
    // Data
    if (entry.data) {
      console.log('  Data:', entry.data);
    }
    
    // Error
    if (entry.error) {
      console.error('  Error:', entry.error.name, '-', entry.error.message);
      if (entry.error.stack) {
        console.error('  Stack:', entry.error.stack);
      }
    }
    
    // Performance
    if (entry.performance) {
      console.log(`  Duration: ${entry.performance.duration}ms`);
    }
  }
  
  /**
   * Structured JSON output for production
   */
  private structuredLog(entry: LogEntry): void {
    // Output as JSON (can be ingested by log aggregators like Datadog, Splunk, etc.)
    console.log(JSON.stringify(entry));
    
    // Optionally send to external logging service
    if (typeof window === 'undefined' && process.env.LOG_ENDPOINT) {
      this.sendToLogService(entry);
    }
  }
  
  /**
   * Send log to external service (async, non-blocking)
   */
  private async sendToLogService(entry: LogEntry): Promise<void> {
    try {
      // Only send ERROR and FATAL to external service (reduce noise)
      if (entry.level < LogLevel.ERROR) {
        return;
      }
      
      await fetch(process.env.LOG_ENDPOINT!, {
        method: 'POST',
        body: JSON.stringify(entry),
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => {
        // Silently fail - don't want logging to break the app
      });
    } catch (error) {
      // Ignore logging errors
    }
  }
}

/**
 * Create child logger with inherited context
 */
export function createChildLogger(parentLogger: Logger, context: LogContext): Logger {
  const child = new Logger();
  child.setContext(context);
  return child;
}

/**
 * Export singleton logger instance
 */
export const logger = new Logger();

/**
 * Performance timing utility
 */
export class PerformanceTimer {
  private startTime: number;
  private label: string;
  
  constructor(label: string) {
    this.label = label;
    this.startTime = Date.now();
  }
  
  /**
   * End timing and log
   */
  end(level: LogLevel = LogLevel.INFO, data?: any): void {
    const duration = Date.now() - this.startTime;
    logger.withTiming(level, `${this.label} completed`, this.startTime, data);
  }
  
  /**
   * Get elapsed time without logging
   */
  elapsed(): number {
    return Date.now() - this.startTime;
  }
}

/**
 * Request logger middleware helper
 */
export function createRequestLogger(requestId: string, userId?: string) {
  const requestLogger = new Logger();
  requestLogger.setContext({
    requestId,
    userId,
    timestamp: new Date().toISOString(),
  });
  return requestLogger;
}

/**
 * Log API request/response
 */
export function logApiRequest(
  method: string,
  path: string,
  status: number,
  duration: number,
  context?: LogContext
): void {
  const level = status >= 500 ? LogLevel.ERROR : status >= 400 ? LogLevel.WARN : LogLevel.INFO;
  
  logger.log(level, `API ${method} ${path} - ${status}`, {
    method,
    path,
    status,
    duration,
  }, context);
}

/**
 * Log database query
 */
export function logDatabaseQuery(
  query: string,
  duration: number,
  rowCount?: number,
  context?: LogContext
): void {
  logger.debug(`Database query executed`, {
    query: query.substring(0, 200), // Truncate long queries
    duration,
    rowCount,
  }, context);
}
