const express = require('express');
const ProductController = require('../controllers/ProductController');
const ProductValidator = require('../validators/ProductValidator');
const ValidationMiddleware = require('../middlewares/ValidationMiddleware');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const RoleMiddleware = require('../middlewares/RoleMiddleware');

const router = express.Router();

/**
 * Public routes (require authentication but any role)
 */

/**
 * @route   GET /api/products
 * @desc    Get all products with pagination and filters
 * @access  Authenticated users (CLIENT and ADMIN)
 */
router.get(
  '/',
  AuthMiddleware.authenticate,
  ProductController.getAllProducts
);

/**
 * @route   GET /api/products/:id
 * @desc    Get product by ID
 * @access  Authenticated users (CLIENT and ADMIN)
 */
router.get(
  '/:id',
  AuthMiddleware.authenticate,
  ProductController.getProductById
);

/**
 * Admin-only routes
 */

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Admin only
 */
router.post(
  '/',
  AuthMiddleware.authenticate,
  RoleMiddleware.isAdmin,
  ValidationMiddleware.validate(ProductValidator.create),
  ProductController.createProduct
);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Admin only
 */
router.put(
  '/:id',
  AuthMiddleware.authenticate,
  RoleMiddleware.isAdmin,
  ValidationMiddleware.validate(ProductValidator.update),
  ProductController.updateProduct
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product
 * @access  Admin only
 */
router.delete(
  '/:id',
  AuthMiddleware.authenticate,
  RoleMiddleware.isAdmin,
  ProductController.deleteProduct
);

/**
 * @route   PATCH /api/products/:id/add-stock
 * @desc    Add stock to product
 * @access  Admin only
 */
router.patch(
  '/:id/add-stock',
  AuthMiddleware.authenticate,
  RoleMiddleware.isAdmin,
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
  AuthMiddleware.authenticate,
  RoleMiddleware.isAdmin,
  ValidationMiddleware.validate(ProductValidator.updateStock),
  ProductController.removeStock
);

module.exports = router;