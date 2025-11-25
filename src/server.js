require('dotenv').config();
const App = require('./app');
const logger = require('./config/logger');
const { sequelize } = require('./models');

/**
 * Server Class
 * Manages server lifecycle and database connection
 */
class Server {
  constructor() {
    this.app = new App().getApp();
    this.port = process.env.PORT || 3000;
    this.server = null;
  }

  /**
   * Initialize database connection
   */
  async initializeDatabase() {
    try {
      await sequelize.authenticate();
      logger.info('✅ Conexión a la base de datos establecida exitosamente');
      
      // Sync models in development (use migrations in production)
      if (process.env.NODE_ENV === 'development') {
        // await sequelize.sync({ alter: true });
        // logger.info('✅ Modelos sincronizados con la base de datos');
      }
    } catch (error) {
      logger.error('❌ Error al conectar a la base de datos:', error);
      throw error;
    }
  }

  /**
   * Start the server
   */
  async start() {
    try {
      // Initialize database
      await this.initializeDatabase();

      // Start listening
      this.server = this.app.listen(this.port, () => {
        logger.info(`🚀 Servidor corriendo en puerto ${this.port}`);
        logger.info(`📝 Entorno: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`🔗 Health check: http://localhost:${this.port}/health`);
        logger.info(`📚 API docs: http://localhost:${this.port}/docs`);
      });

      // Handle server errors
      this.server.on('error', (error) => {
        logger.error('Error en el servidor:', error);
        process.exit(1);
      });
    } catch (error) {
      logger.error('Error al iniciar el servidor:', error);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(signal) {
    logger.info(`\n${signal} recibido. Cerrando servidor gracefully...`);

    if (this.server) {
      this.server.close(async () => {
        logger.info('✅ Servidor HTTP cerrado');

        try {
          await sequelize.close();
          logger.info('✅ Conexión a la base de datos cerrada');
          process.exit(0);
        } catch (error) {
          logger.error('❌ Error al cerrar la conexión a la base de datos:', error);
          process.exit(1);
        }
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('⚠️ Forzando cierre del servidor');
        process.exit(1);
      }, 10000);
    } else {
      process.exit(0);
    }
  }
}

// Create server instance
const server = new Server();

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Cerrando...', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('UNHANDLED REJECTION! 💥 Cerrando...', {
    reason,
    promise,
  });
  server.shutdown('UNHANDLED_REJECTION');
});

// Handle termination signals
process.on('SIGTERM', () => server.shutdown('SIGTERM'));
process.on('SIGINT', () => server.shutdown('SIGINT'));

// Start server
server.start();