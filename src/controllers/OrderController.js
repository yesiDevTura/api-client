const OrderService = require('../services/OrderService');
const ApiResponse = require('../utils/ApiResponse');
const ErrorHandler = require('../middlewares/ErrorHandler');




/**
 * Order Controller Class
 */
class OrderController {
  /**
   * Create a new order (CLIENT)
   */
  static createOrder = ErrorHandler.catchAsync(async (req, res) => {
    const order = await OrderService.createOrder(req.user.id, req.body);

    ApiResponse.created(order, 'Orden creada exitosamente').send(res);
  });

  /**
   * Get all orders
   * - ADMIN: See all orders
   * - CLIENT: See only their orders
   */
  static getAllOrders = ErrorHandler.catchAsync(async (req, res) => {
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      userId: req.query.userId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };

    const result = await OrderService.getAllOrders(
      req.user.id,
      req.user.role,
      filters
    );

    ApiResponse.paginated(
      result.orders,
      result.pagination,
      'Órdenes obtenidas exitosamente'
    ).send(res);
  });

  /**
   * Get order by ID (invoice)
   */
  static getOrderById = ErrorHandler.catchAsync(async (req, res) => {
    const order = await OrderService.getOrderById(
      req.params.id,
      req.user.id,
      req.user.role
    );

    ApiResponse.success(order, 'Factura obtenida exitosamente').send(res);
  });

  /**
   * Get user order history (CLIENT)
   */
  static getUserOrderHistory = ErrorHandler.catchAsync(async (req, res) => {
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const result = await OrderService.getUserOrderHistory(req.user.id, filters);

    ApiResponse.paginated(
      result.orders,
      result.pagination,
      'Historial de compras obtenido exitosamente'
    ).send(res);
  });

  /**
   * Update order (CLIENT)
   */
  static updateOrder = ErrorHandler.catchAsync(async (req, res) => {
    const order = await OrderService.updateOrder(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );

    ApiResponse.success(order, 'Orden actualizada exitosamente').send(res);
  });

    /**
   * Complete order (ADMIN)
   */
  static completeOrder = ErrorHandler.catchAsync(async (req, res) => {
    const order = await OrderService.completeOrder(
      req.params.id,
      req.user.id,
      req.user.role
    );

    ApiResponse.success(order, 'Orden completada exitosamente').send(res);
  });

  /**
   * Cancel order (CLIENT)
   */
  static cancelOrder = ErrorHandler.catchAsync(async (req, res) => {
    const order = await OrderService.cancelOrder(
      req.params.id,
      req.user.id,
      req.user.role
    );

    ApiResponse.success(order, 'Orden cancelada exitosamente').send(res);
  });
}

module.exports = OrderController;