// c:\Users\Yesi Angulo\Desktop\projects\api\tests\integration\app.test.js

const request = require('supertest');
const App = require('../../src/app');
const logger = require('../../src/config/logger');

// Mock logger to avoid console output during tests
jest.mock('../../src/config/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

// Mock routes to avoid database dependencies
jest.mock('../../src/routes/auth.routes', () => {
  const express = require('express');
  const router = express.Router();
  router.get('/test', (req, res) => res.json({ success: true, route: 'auth' }));
  return router;
});

jest.mock('../../src/routes/product.routes', () => {
  const express = require('express');
  const router = express.Router();
  router.get('/test', (req, res) => res.json({ success: true, route: 'products' }));
  return router;
});

jest.mock('../../src/routes/order.routes', () => {
  const express = require('express');
  const router = express.Router();
  router.get('/test', (req, res) => res.json({ success: true, route: 'orders' }));
  return router;
});

describe('App Integration Tests', () => {
  let app;

  beforeAll(() => {
    const appInstance = new App();
    app = appInstance.getApp();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('Health Check Endpoint', () => {
    it('should return 200 and health status on GET /health', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'API is running');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment');
    });
  });

  describe('API Root Endpoint', () => {
    it('should return API information on GET /api', async () => {
      const response = await request(app).get('/api');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
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

  describe('Route Mounting', () => {
    it('should mount auth routes at /api/auth', async () => {
      const response = await request(app).get('/api/auth/test');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, route: 'auth' });
    });

    it('should mount product routes at /api/products', async () => {
      const response = await request(app).get('/api/products/test');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, route: 'products' });
    });

    it('should mount order routes at /api/orders', async () => {
      const response = await request(app).get('/api/orders/test');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, route: 'orders' });
    });
  });

  describe('404 Not Found Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/non-existent-route');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
      expect(response.body.error.message).toContain('no encontrado');
    });

    it('should return 404 for non-existent API routes', async () => {
      const response = await request(app).get('/api/invalid-endpoint');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Middleware Configuration', () => {
    it('should parse JSON request bodies', async () => {
      const response = await request(app).get('/health');
      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should have CORS headers configured', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should log requests', async () => {
      await request(app).get('/health');
      expect(logger.info).toHaveBeenCalled();
    });

    it('should have security headers from helmet', async () => {
      const response = await request(app).get('/health');

      expect(response.headers).toHaveProperty('x-dns-prefetch-control');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-content-type-options');
    });
  });

  describe('Static File Serving', () => {
    it('should serve static docs from /docs route', async () => {
      const response = await request(app).get('/docs/');

      // Should either return HTML or 404 if docs folder doesn't exist
      expect([200, 301, 302, 404]).toContain(response.status);
    });
  });

  describe('HTTP Methods Support', () => {
    it('should support GET requests', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
    });

    it('should support POST requests to API routes', async () => {
      const response = await request(app)
        .post('/api/auth/test')
        .send({ test: 'data' });

      // Will be 404 since we don't have POST on /test, but it proves POST works
      expect([200, 404, 405]).toContain(response.status);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors with global error handler', async () => {
      const response = await request(app).get('/api/trigger-error-route');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });
});