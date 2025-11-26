const ProductController = require('../../../src/controllers/ProductController');
const ProductService = require('../../../src/services/ProductService');
const ApiResponse = require('../../../src/utils/ApiResponse');

// Mock dependencies
jest.mock('../../../src/services/ProductService');
jest.mock('../../../src/utils/ApiResponse');

describe('ProductController', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {}, user: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should create product successfully', async () => {
      const mockProduct = {
        id: 'product-id',
        name: 'Laptop',
        price: 899.99,
        lotNumber: 'LOT-0001',
      };
      req.body = { name: 'Laptop', price: 899.99, stock: 10 };
      
      ProductService.createProduct = jest.fn().mockResolvedValue(mockProduct);
      const mockResponse = { send: jest.fn() };
      ApiResponse.created = jest.fn().mockReturnValue(mockResponse);

      await ProductController.createProduct(req, res);

      expect(ProductService.createProduct).toHaveBeenCalledWith(req.body);
      expect(ApiResponse.created).toHaveBeenCalledWith(
        mockProduct,
        'Producto creado exitosamente'
      );
      expect(mockResponse.send).toHaveBeenCalledWith(res);
    });
  });

  describe('getAllProducts', () => {
    it('should get all products with filters', async () => {
      req.query = { page: '1', limit: '10', search: 'laptop' };
      const mockResult = {
        products: [{ id: '1', name: 'Product 1' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      ProductService.getAllProducts = jest.fn().mockResolvedValue(mockResult);
      const mockResponse = { send: jest.fn() };
      ApiResponse.paginated = jest.fn().mockReturnValue(mockResponse);

      await ProductController.getAllProducts(req, res);

      expect(ProductService.getAllProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          page: '1',
          limit: '10',
          search: 'laptop',
        })
      );
      expect(ApiResponse.paginated).toHaveBeenCalled();
    });
  });

  describe('getProductById', () => {
    it('should get product by id', async () => {
      req.params.id = 'product-id';
      const mockProduct = { id: 'product-id', name: 'Laptop' };

      ProductService.getProductById = jest.fn().mockResolvedValue(mockProduct);
      const mockResponse = { send: jest.fn() };
      ApiResponse.success = jest.fn().mockReturnValue(mockResponse);

      await ProductController.getProductById(req, res);

      expect(ProductService.getProductById).toHaveBeenCalledWith('product-id');
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockProduct,
        'Producto obtenido exitosamente'
      );
    });
  });

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      req.params.id = 'product-id';
      req.body = { name: 'Updated Product', price: 999.99 };
      const mockProduct = { id: 'product-id', name: 'Updated Product' };

      ProductService.updateProduct = jest.fn().mockResolvedValue(mockProduct);
      const mockResponse = { send: jest.fn() };
      ApiResponse.success = jest.fn().mockReturnValue(mockResponse);

      await ProductController.updateProduct(req, res);

      expect(ProductService.updateProduct).toHaveBeenCalledWith('product-id', req.body);
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockProduct,
        'Producto actualizado exitosamente'
      );
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      req.params.id = 'product-id';
      const mockProduct = { id: 'product-id', isActive: false };

      ProductService.deleteProduct = jest.fn().mockResolvedValue(mockProduct);
      const mockResponse = { send: jest.fn() };
      ApiResponse.success = jest.fn().mockReturnValue(mockResponse);

      await ProductController.deleteProduct(req, res);

      expect(ProductService.deleteProduct).toHaveBeenCalledWith('product-id');
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockProduct,
        'Producto eliminado exitosamente'
      );
    });
  });

  describe('addStock', () => {
    it('should add stock to product', async () => {
      req.params.id = 'product-id';
      req.body = { quantity: 50 };
      const mockProduct = { id: 'product-id', stock: 60 };

      ProductService.addStock = jest.fn().mockResolvedValue(mockProduct);
      const mockResponse = { send: jest.fn() };
      ApiResponse.success = jest.fn().mockReturnValue(mockResponse);

      await ProductController.addStock(req, res);

      expect(ProductService.addStock).toHaveBeenCalledWith('product-id', 50);
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockProduct,
        'Stock añadido exitosamente'
      );
    });
  });

  describe('removeStock', () => {
    it('should remove stock from product', async () => {
      req.params.id = 'product-id';
      req.body = { quantity: 10 };
      const mockProduct = { id: 'product-id', stock: 40 };

      ProductService.removeStock = jest.fn().mockResolvedValue(mockProduct);
      const mockResponse = { send: jest.fn() };
      ApiResponse.success = jest.fn().mockReturnValue(mockResponse);

      await ProductController.removeStock(req, res);

      expect(ProductService.removeStock).toHaveBeenCalledWith('product-id', 10);
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockProduct,
        'Stock removido exitosamente'
      );
    });
  });
});