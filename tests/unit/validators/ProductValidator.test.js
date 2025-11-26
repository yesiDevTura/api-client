const ProductValidator = require('../../../src/validators/ProductValidator');

describe('ProductValidator', () => {
  describe('create', () => {
    it('should validate correct product data', () => {
      const data = {
        name: 'Laptop HP',
        price: 899.99,
        stock: 10,
        description: 'Gaming laptop',
      };

      const { error } = ProductValidator.create.validate(data);
      expect(error).toBeUndefined();
    });

    it('should reject missing required fields', () => {
      const data = { name: 'Laptop' };

      const { error } = ProductValidator.create.validate(data);
      expect(error).toBeDefined();
    });

    it('should reject negative price', () => {
      const data = { name: 'Laptop', price: -10, stock: 5 };

      const { error } = ProductValidator.create.validate(data);
      expect(error).toBeDefined();
    });

    it('should accept optional lotNumber', () => {
      const data = {
        name: 'Laptop',
        price: 899.99,
        stock: 10,
        lotNumber: 'LOT-0050',
      };

      const { error } = ProductValidator.create.validate(data);
      expect(error).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should validate update data', () => {
      const data = { name: 'Updated Product', price: 999.99 };

      const { error } = ProductValidator.update.validate(data);
      expect(error).toBeUndefined();
    });

    it('should allow partial updates', () => {
      const data = { price: 999.99 };

      const { error } = ProductValidator.update.validate(data);
      expect(error).toBeUndefined();
    });
  });

  describe('updateStock', () => {
    it('should validate stock quantity', () => {
      const data = { quantity: 50 };

      const { error } = ProductValidator.updateStock.validate(data);
      expect(error).toBeUndefined();
    });

    it('should reject negative quantity', () => {
      const data = { quantity: -10 };

      const { error } = ProductValidator.updateStock.validate(data);
      expect(error).toBeDefined();
    });
  });
});