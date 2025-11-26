const OrderValidator = require('../../../src/validators/OrderValidator');

describe('OrderValidator', () => {
  describe('create', () => {
    it('should validate correct order data', () => {
      const data = {
        items: [
          { productId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', quantity: 2 },
          { productId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901', quantity: 1 },
        ],
      };

      const { error } = OrderValidator.create.validate(data);
      expect(error).toBeUndefined();
    });

    it('should reject missing items', () => {
      const data = {};

      const { error } = OrderValidator.create.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('items');
    });

    it('should reject empty items array', () => {
      const data = { items: [] };

      const { error } = OrderValidator.create.validate(data);
      expect(error).toBeDefined();
    });

    it('should reject invalid productId (not UUID)', () => {
      const data = {
        items: [{ productId: 'invalid-id', quantity: 1 }],
      };

      const { error } = OrderValidator.create.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('UUID');
    });

    it('should reject missing productId', () => {
      const data = {
        items: [{ quantity: 1 }],
      };

      const { error } = OrderValidator.create.validate(data);
      expect(error).toBeDefined();
    });

    it('should reject missing quantity', () => {
      const data = {
        items: [{ productId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' }],
      };

      const { error } = OrderValidator.create.validate(data);
      expect(error).toBeDefined();
    });

    it('should reject quantity less than 1', () => {
      const data = {
        items: [{ productId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', quantity: 0 }],
      };

      const { error } = OrderValidator.create.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('mayor a 0');
    });

    it('should reject negative quantity', () => {
      const data = {
        items: [{ productId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', quantity: -5 }],
      };

      const { error } = OrderValidator.create.validate(data);
      expect(error).toBeDefined();
    });

    it('should reject non-integer quantity', () => {
      const data = {
        items: [{ productId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', quantity: 1.5 }],
      };

      const { error } = OrderValidator.create.validate(data);
      expect(error).toBeDefined();
    });

    it('should accept multiple items with valid data', () => {
      const data = {
        items: [
          { productId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', quantity: 1 },
          { productId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901', quantity: 10 },
          { productId: 'c3d4e5f6-a7b8-9012-cdef-123456789012', quantity: 5 },
        ],
      };

      const { error } = OrderValidator.create.validate(data);
      expect(error).toBeUndefined();
    });
  });
});
