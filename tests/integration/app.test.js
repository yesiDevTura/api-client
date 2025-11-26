const request = require('supertest');
const App = require('../../src/app');

// Mock logger to avoid console output during tests
jest.mock('../../src/config/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

// Mock database models to avoid DB connection
jest.mock('../../src/models', () => ({
  sequelize: {
    authenticate: jest.fn(),
  },
  User: {},
  Product: {},
  Order: {},
  OrderItem: {},
}));

describe('App Integration Tests', () => {
  let app;

  beforeAll(() => {
    const appInstance = new App();
    app = appInstance.getApp();
  });

  describe('Health Check Endpoint', () => {
    it('GET /health should return 200 and health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        message: 'API is running',
        environment: expect.any(String),
      });
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('API Root Endpoint', () => {
    it('GET /api should return API information', async () => {
      const response = await request(app).get('/api');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
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
  });

  describe('404 Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/non-existent-route');

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        error: expect.objectContaining({
          code: 'NOT_FOUND',
          statusCode: 404,
        }),
      });
    });

    it('should return 404 for non-existent API routes', async () => {
      const response = await request(app).get('/api/invalid-endpoint');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Middleware Configuration', () => {
    it('should handle JSON requests', async () => {
      const response = await request(app)
        .get('/health')
        .set('Content-Type', 'application/json');

      // Should handle JSON content type
      expect(response.status).toBe(200);
      expect(response.type).toContain('json');
    });

    it('should include CORS headers', async () => {
      const response = await request(app).get('/health');

      // CORS headers should be present
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should include security headers from helmet', async () => {
      const response = await request(app).get('/health');

      // Helmet adds security headers
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should parse JSON body correctly', async () => {
      const response = await request(app).get('/api');

      // Response should be valid JSON
      expect(response.body).toBeDefined();
      expect(response.body.success).toBe(true);
      expect(typeof response.body).toBe('object');
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to /api routes', async () => {
      const response = await request(app).get('/api');

      // Check for rate limit headers
      expect(response.headers['ratelimit-limit']).toBeDefined();
      expect(response.headers['ratelimit-remaining']).toBeDefined();
    });
  });

  describe('App Instance', () => {
    it('should create app instance successfully', () => {
      const appInstance = new App();
      expect(appInstance).toBeInstanceOf(App);
      expect(appInstance.getApp()).toBeDefined();
    });

    it('should return express app from getApp()', () => {
      const appInstance = new App();
      const expressApp = appInstance.getApp();
      
      expect(typeof expressApp).toBe('function');
      expect(expressApp.use).toBeDefined();
      expect(expressApp.get).toBeDefined();
    });
  });
});
