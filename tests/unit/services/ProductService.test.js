const ProductService = require('../../../src/services/ProductService');
const { Product } = require('../../../src/models');
const AppError = require('../../../src/utils/AppError');
const { Op } = require('sequelize');

// Mock dependencies
jest.mock('../../../src/models');
jest.mock('../../../src/config/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe('ProductService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    const productData = {
      name: 'Laptop HP',
      price: 899.99,
      stock: 10,
      description: 'Gaming laptop',
    };

    it('should create a product successfully without lotNumber', async () => {
      Product.findOne = jest.fn().mockResolvedValue(null);
      const mockProduct = { id: 'product-id', lotNumber: 'LOT-0001', ...productData };
      Product.create = jest.fn().mockResolvedValue(mockProduct);

      const result = await ProductService.createProduct(productData);

      expect(Product.create).toHaveBeenCalledWith(productData);
      expect(result).toEqual(mockProduct);
    });

    it('should create a product with provided lotNumber', async () => {
      const dataWithLot = { ...productData, lotNumber: 'LOT-0050' };
      Product.findOne = jest.fn().mockResolvedValue(null);
      const mockProduct = { id: 'product-id', ...dataWithLot };
      Product.create = jest.fn().mockResolvedValue(mockProduct);

      const result = await ProductService.createProduct(dataWithLot);

      expect(Product.findOne).toHaveBeenCalledWith({
        where: { lotNumber: 'LOT-0050' },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw conflict error if lotNumber exists', async () => {
      const dataWithLot = { ...productData, lotNumber: 'LOT-0001' };
      Product.findOne = jest.fn().mockResolvedValue({ lotNumber: 'LOT-0001' });

      await expect(ProductService.createProduct(dataWithLot)).rejects.toThrow(
        'El número de lote ya existe'
      );
    });

    it('should handle database errors', async () => {
      Product.findOne = jest.fn().mockResolvedValue(null);
      Product.create = jest.fn().mockRejectedValue(new Error('DB error'));

      await expect(ProductService.createProduct(productData)).rejects.toThrow('DB error');
    });
  });

  describe('getAllProducts', () => {
    it('should return products with default pagination', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', isActive: true },
        { id: '2', name: 'Product 2', isActive: true },
      ];
      Product.findAndCountAll = jest.fn().mockResolvedValue({
        rows: mockProducts,
        count: 2,
      });

      const result = await ProductService.getAllProducts({});

      expect(Product.findAndCountAll).toHaveBeenCalledWith({
        where: { isActive: true },
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']],
      });
      expect(result.products).toEqual(mockProducts);
      expect(result.pagination.total).toBe(2);
    });

    it('should filter products by search term', async () => {
      Product.findAndCountAll = jest.fn().mockResolvedValue({ rows: [], count: 0 });

      await ProductService.getAllProducts({ search: 'laptop' });

      expect(Product.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            [Op.or]: expect.any(Array),
          }),
        })
      );
    });

    it('should filter by price range', async () => {
      Product.findAndCountAll = jest.fn().mockResolvedValue({ rows: [], count: 0 });

      await ProductService.getAllProducts({ minPrice: 100, maxPrice: 500 });

      expect(Product.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            price: { [Op.gte]: 100, [Op.lte]: 500 },
          }),
        })
      );
    });

    it('should filter products in stock', async () => {
      Product.findAndCountAll = jest.fn().mockResolvedValue({ rows: [], count: 0 });

      await ProductService.getAllProducts({ inStock: true });

      expect(Product.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            stock: { [Op.gt]: 0 },
          }),
        })
      );
    });
  });

  describe('getProductById', () => {
    it('should return product if exists', async () => {
      const mockProduct = { id: 'product-id', name: 'Laptop' };
      Product.findByPk = jest.fn().mockResolvedValue(mockProduct);

      const result = await ProductService.getProductById('product-id');

      expect(result).toEqual(mockProduct);
    });

    it('should throw not found error if product does not exist', async () => {
      Product.findByPk = jest.fn().mockResolvedValue(null);

      await expect(ProductService.getProductById('invalid-id')).rejects.toThrow('Producto');
    });
  });

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      const mockProduct = {
        id: 'product-id',
        lotNumber: 'LOT-0001',
        update: jest.fn().mockResolvedValue(true),
      };
      Product.findByPk = jest.fn().mockResolvedValue(mockProduct);

      await ProductService.updateProduct('product-id', { name: 'Updated' });

      expect(mockProduct.update).toHaveBeenCalledWith({ name: 'Updated' });
    });

    it('should check lotNumber uniqueness when updating', async () => {
      const mockProduct = {
        id: 'product-id',
        lotNumber: 'LOT-0001',
        update: jest.fn().mockResolvedValue(true),
      };
      Product.findByPk = jest.fn().mockResolvedValue(mockProduct);
      Product.findOne = jest.fn().mockResolvedValue(null);

      await ProductService.updateProduct('product-id', { lotNumber: 'LOT-0050' });

      expect(Product.findOne).toHaveBeenCalledWith({
        where: {
          lotNumber: 'LOT-0050',
          id: { [Op.ne]: 'product-id' },
        },
      });
    });

    it('should throw conflict if lotNumber exists', async () => {
      const mockProduct = { id: 'product-id', lotNumber: 'LOT-0001' };
      Product.findByPk = jest.fn().mockResolvedValue(mockProduct);
      Product.findOne = jest.fn().mockResolvedValue({ id: 'other-id' });

      await expect(
        ProductService.updateProduct('product-id', { lotNumber: 'LOT-0050' })
      ).rejects.toThrow('El número de lote ya existe');
    });
  });

  describe('deleteProduct', () => {
    it('should soft delete product', async () => {
      const mockProduct = {
        id: 'product-id',
        isActive: true,
        update: jest.fn().mockResolvedValue({ isActive: false }),
      };
      Product.findByPk = jest.fn().mockResolvedValue(mockProduct);

      await ProductService.deleteProduct('product-id');

      expect(mockProduct.update).toHaveBeenCalledWith({ isActive: false });
    });
  });

  describe('addStock', () => {
    it('should add stock successfully', async () => {
      const mockProduct = {
        id: 'product-id',
        stock: 10,
        addStock: jest.fn().mockResolvedValue(true),
      };
      Product.findByPk = jest.fn().mockResolvedValue(mockProduct);

      await ProductService.addStock('product-id', 20);

      expect(mockProduct.addStock).toHaveBeenCalledWith(20);
    });
  });

  describe('removeStock', () => {
    it('should remove stock successfully', async () => {
      const mockProduct = {
        id: 'product-id',
        stock: 50,
        removeStock: jest.fn().mockResolvedValue(true),
      };
      Product.findByPk = jest.fn().mockResolvedValue(mockProduct);

      await ProductService.removeStock('product-id', 10);

      expect(mockProduct.removeStock).toHaveBeenCalledWith(10);
    });
  });
});