const winston = require('winston');
const path = require('path');

/**
 * Logger Configuration using Winston
 * Implements Singleton pattern
 */
class Logger {
  constructor() {
    if (Logger.instance) {
      return Logger.instance;
    }

    const logLevel = process.env.LOG_LEVEL || 'info';
    const isDevelopment = process.env.NODE_ENV !== 'production';

    // Define log format
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json()
    );

    // Create transports
    const transports = [
      // Console transport
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(
            ({ timestamp, level, message, stack, ...meta }) => {
              let log = `${timestamp} [${level}]: ${message}`;
              if (Object.keys(meta).length > 0) {
                log += ` ${JSON.stringify(meta)}`;
              }
              if (stack) {
                log += `\n${stack}`;
              }
              return log;
            }
          )
        ),
      }),
    ];

    // Add file transports in production
    if (!isDevelopment) {
      transports.push(
        new winston.transports.File({
          filename: path.join('logs', 'error.log'),
          level: 'error',
          format: logFormat,
        }),
        new winston.transports.File({
          filename: path.join('logs', 'combined.log'),
          format: logFormat,
        })
      );
    }

    this.logger = winston.createLogger({
      level: logLevel,
      format: logFormat,
      transports,
      exitOnError: false,
    });

    Logger.instance = this;
  }

  /**
   * Get logger instance
   */
  getLogger() {
    return this.logger;
  }

  /**
   * Log info level
   */
  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  /**
   * Log error level
   */
  error(message, meta = {}) {
    this.logger.error(message, meta);
  }

  /**
   * Log warn level
   */
  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }

  /**
   * Log debug level
   */
  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }
}

// Export singleton instance
const loggerInstance = new Logger();
module.exports = loggerInstance;