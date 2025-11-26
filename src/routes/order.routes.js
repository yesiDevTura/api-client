const express = require('express');
const OrderController = require('../controllers/OrderController');
const OrderValidator = require('../validators/OrderValidator');
const ValidationMiddleware = require('../middlewares/ValidationMiddleware');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const RoleMiddleware = require('../middlewares/RoleMiddleware');

const router = express.Router();

/**
 * All order routes require authentication
 */
router.use(AuthMiddleware.authenticate);

/**
 * @route   POST /api/orders
 * @desc    Create a new order (purchase)
 * @access  Client only
 */
router.post(
  '/',
  RoleMiddleware.isClient,
  ValidationMiddleware.validate(OrderValidator.create),
  OrderController.createOrder
);

/**
 * @route   GET /api/orders
 * @desc    Get all orders (ADMIN) or user orders (CLIENT)
 * @access  Authenticated users
 */
router.get('/', OrderController.getAllOrders);

/**
 * @route   GET /api/orders/history
 * @desc    Get user order history
 * @access  Client only
 */
router.get(
  '/history',
  RoleMiddleware.isClient,
  OrderController.getUserOrderHistory
);

/**
 * @route   PUT /api/orders/:id
 * @desc    Update order (only PENDING orders)
 * @access  Client only (own orders)
 */
router.put(
  '/:id',
  RoleMiddleware.isClient,
  ValidationMiddleware.validate(OrderValidator.create),
  OrderController.updateOrder
);

/**
 * @route   PATCH /api/orders/:id/cancel
 * @desc    Cancel order
 * @access  Client only (own orders)
 */
router.patch('/:id/cancel', RoleMiddleware.isClient, OrderController.cancelOrder);

router.patch('/:id/complete', RoleMiddleware.isAdmin, OrderController.completeOrder);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID (invoice)
 * @access  Authenticated users (own orders for CLIENT, all for ADMIN)
 */
router.get('/:id', OrderController.getOrderById);

module.exports = router;