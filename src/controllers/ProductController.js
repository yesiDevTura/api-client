const ProductService = require('../services/ProductService');
const ApiResponse = require('../utils/ApiResponse');
const ErrorHandler = require('../middlewares/ErrorHandler');

/**
 * Product Controller Class
 */
class ProductController {
  /**
   * Create a new product
   */
  static createProduct = ErrorHandler.catchAsync(async (req, res) => {
    const product = await ProductService.createProduct(req.body);

    const response = ApiResponse.created(
      product,
      'Producto creado exitosamente'
    );

    response.send(res);
  });

  /**
   * Get all products with pagination and filters
   */
  static getAllProducts = ErrorHandler.catchAsync(async (req, res) => {
    console.log('1. Controller received filters:', req.query);
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      inStock: req.query.inStock,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };

    const result = await ProductService.getAllProducts(filters);

    ApiResponse.paginated(
      result.products,
      result.pagination,
      'Productos obtenidos exitosamente'
    ).send(res);
  });

  /**
   * Get product by ID
   */
  static getProductById = ErrorHandler.catchAsync(async (req, res) => {
    const product = await ProductService.getProductById(req.params.id);

    ApiResponse.success(
      product,
      'Producto obtenido exitosamente'
    ).send(res);
  });

  /**
   * Update product
   */
  static updateProduct = ErrorHandler.catchAsync(async (req, res) => {
    const product = await ProductService.updateProduct(req.params.id, req.body);

    ApiResponse.success(
      product,
      'Producto actualizado exitosamente'
    ).send(res);
  });

  /**
   * Delete product
   */
  static deleteProduct = ErrorHandler.catchAsync(async (req, res) => {
    const product = await ProductService.deleteProduct(req.params.id);

    ApiResponse.success(
      product,
      'Producto eliminado exitosamente'
    ).send(res);
  });

  /**
   * Add stock to product
   */
  static addStock = ErrorHandler.catchAsync(async (req, res) => {
    const product = await ProductService.addStock(
      req.params.id,
      req.body.quantity
    );

    ApiResponse.success(
      product,
      'Stock añadido exitosamente'
    ).send(res);
  });

  /**
   * Remove stock from product
   */
  static removeStock = ErrorHandler.catchAsync(async (req, res) => {
    const product = await ProductService.removeStock(
      req.params.id,
      req.body.quantity
    );

    ApiResponse.success(
      product,
      'Stock removido exitosamente'
    ).send(res);
  });
}

module.exports = ProductController;