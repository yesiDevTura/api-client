const express = require('express');
const ProductController = require('../controllers/ProductController');
const ProductValidator = require('../validators/ProductValidator');
const ValidationMiddleware = require('../middlewares/ValidationMiddleware');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const RoleMiddleware = require('../middlewares/RoleMiddleware');

const router = express.Router();

/**
 * All product routes require authentication and ADMIN role
 */
router.use(AuthMiddleware.authenticate);
router.use(RoleMiddleware.isAdmin);

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Admin only
 */
router.post(
  '/',
  ValidationMiddleware.validate(ProductValidator.create),
  ProductController.createProduct
);

/**
 * @route   GET /api/products
 * @desc    Get all products with pagination and filters
 * @access  Admin only
 */
router.get('/', ProductController.getAllProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get product by ID
 * @access  Admin only
 */
router.get('/:id', ProductController.getProductById);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Admin only
 */
router.put(
  '/:id',
  ValidationMiddleware.validate(ProductValidator.update),
  ProductController.updateProduct
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product
 * @access  Admin only
 */
router.delete('/:id', ProductController.deleteProduct);

/**
 * @route   PATCH /api/products/:id/add-stock
 * @desc    Add stock to product
 * @access  Admin only
 */
router.patch(
  '/:id/add-stock',
  ValidationMiddleware.validate(ProductValidator.updateStock),
  ProductController.addStock
);

/**
 * @route   PATCH /api/products/:id/remove-stock
 * @desc    Remove stock from product
 * @access  Admin only
 */
router.patch(
  '/:id/remove-stock',
  ValidationMiddleware.validate(ProductValidator.updateStock),
  ProductController.removeStock
);

module.exports = router;