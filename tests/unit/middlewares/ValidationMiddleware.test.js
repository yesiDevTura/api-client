const ValidationMiddleware = require('../../../src/middlewares/ValidationMiddleware');
const Joi = require('joi');

describe('ValidationMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('validate', () => {
    it('should call next when validation passes', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        age: Joi.number().required(),
      });

      req.body = {
        name: 'John Doe',
        age: 30,
      };

      const middleware = ValidationMiddleware.validate(schema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next with error when validation fails', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
      });

      req.body = {
        name: 'John Doe',
        email: 'invalid-email',
      };

      const middleware = ValidationMiddleware.validate(schema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(Error);
      expect(error.statusCode).toBe(422);
      expect(error.message).toContain('validación');
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should include validation details in error', () => {
      const schema = Joi.object({
        password: Joi.string().min(8).required(),
      });

      req.body = {
        password: '123',
      };

      const middleware = ValidationMiddleware.validate(schema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(Error);
      expect(error.statusCode).toBe(422);
      expect(error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'password',
          }),
        ])
      );
    });

    it('should handle missing required fields', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required(),
      });

      req.body = {};

      const middleware = ValidationMiddleware.validate(schema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(Error);
      expect(error.statusCode).toBe(422);
      expect(error.details).toBeInstanceOf(Array);
      expect(error.details.length).toBeGreaterThan(0);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should strip unknown fields when configured', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
      });

      req.body = {
        name: 'John Doe',
        unknownField: 'should be removed',
      };

      const middleware = ValidationMiddleware.validate(schema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.body).not.toHaveProperty('unknownField');
    });
  });
});
