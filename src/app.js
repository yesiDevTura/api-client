const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const ErrorHandler = require('./middlewares/ErrorHandler');
const logger = require('./config/logger');

// Import routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');

/**
 * Application Class
 * Configures and initializes the Express application
 */
class App {
  constructor() {
    this.app = express();
    this.configureMiddlewares();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  /**
   * Configure application middlewares
   */
  configureMiddlewares() {
    // Security middleware
    this.app.use(helmet());

    // CORS configuration
    const corsOptions = {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
      optionsSuccessStatus: 200,
    };
    this.app.use(cors(corsOptions));

    // Body parser middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
      message: {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Demasiadas peticiones desde esta IP, por favor intente más tarde',
        },
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api', limiter);

    // Request logging middleware
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });
      next();
    });
  }

  /**
   * Configure application routes
   */
  configureRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/products', productRoutes);
    this.app.use('/api/orders', orderRoutes);

    // API root endpoint
    this.app.get('/api', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Inventory API v1.0',
        documentation: '/docs',
        endpoints: {
          health: '/health',
          auth: '/api/auth',
          products: '/api/products',
          orders: '/api/orders',
        },
      });
    });
  }

  /**
   * Configure error handling
   */
  configureErrorHandling() {
    // Handle 404 errors
    this.app.use(ErrorHandler.notFound);

    // Global error handler
    this.app.use(ErrorHandler.handle);
  }

  /**
   * Get Express application instance
   */
  getApp() {
    return this.app;
  }
}

module.exports = App;