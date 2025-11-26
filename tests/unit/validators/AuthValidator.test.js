const AuthValidator = require('../../../src/validators/AuthValidator');

describe('AuthValidator', () => {
  describe('register', () => {
    it('should validate correct registration data', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123',
        role: 'CLIENT',
      };

      const { error } = AuthValidator.register().validate(data);
      expect(error).toBeUndefined();
    });

    it('should reject missing name', () => {
      const data = {
        email: 'john@example.com',
        password: 'SecurePass123',
      };

      const { error } = AuthValidator.register().validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('name');
    });

    it('should reject invalid email', () => {
      const data = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'SecurePass123',
      };

      const { error } = AuthValidator.register().validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('email');
    });

    it('should reject short password', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123',
      };

      const { error } = AuthValidator.register().validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('password');
    });

    it('should reject invalid role', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123',
        role: 'INVALID_ROLE',
      };

      const { error } = AuthValidator.register().validate(data);
      expect(error).toBeDefined();
    });

    it('should default role to CLIENT if not provided', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123',
      };

      const { error, value } = AuthValidator.register().validate(data);
      expect(error).toBeUndefined();
      expect(value.role).toBe('CLIENT');
    });
  });

  describe('login', () => {
    it('should validate correct login data', () => {
      const data = {
        email: 'john@example.com',
        password: 'SecurePass123',
      };

      const { error } = AuthValidator.login().validate(data);
      expect(error).toBeUndefined();
    });

    it('should reject missing email', () => {
      const data = {
        password: 'SecurePass123',
      };

      const { error } = AuthValidator.login().validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('email');
    });

    it('should reject missing password', () => {
      const data = {
        email: 'john@example.com',
      };

      const { error } = AuthValidator.login().validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('password');
    });

    it('should reject invalid email format', () => {
      const data = {
        email: 'not-an-email',
        password: 'SecurePass123',
      };

      const { error } = AuthValidator.login().validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('email');
    });

    it('should reject empty credentials', () => {
      const data = {};

      const { error } = AuthValidator.login().validate(data);
      expect(error).toBeDefined();
    });
  });
});
