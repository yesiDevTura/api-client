const OrderController = require('../../../src/controllers/OrderController');
const OrderService = require('../../../src/services/OrderService');
const ApiResponse = require('../../../src/utils/ApiResponse');

// Mock dependencies
jest.mock('../../../src/services/OrderService');
jest.mock('../../../src/utils/ApiResponse');

describe('OrderController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    
    req = {
      user: { id: 'user-123', role: 'CLIENT' },
      params: {},
      body: {},
      query: {},
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock ApiResponse
    ApiResponse.success = jest.fn().mockReturnValue({
      send: jest.fn(),
    });
    ApiResponse.created = jest.fn().mockReturnValue({
      send: jest.fn(),
    });
    ApiResponse.paginated = jest.fn().mockReturnValue({
      send: jest.fn(),
    });
  });

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      const mockOrder = { id: 'order-123', userId: 'user-123', total: 1000 };
      req.body = {
        items: [{ productId: 'product-1', quantity: 2 }],
      };

      OrderService.createOrder = jest.fn().mockResolvedValue(mockOrder);

      await OrderController.createOrder(req, res);

      expect(OrderService.createOrder).toHaveBeenCalledWith('user-123', req.body);
      expect(ApiResponse.created).toHaveBeenCalledWith(
        mockOrder,
        'Orden creada exitosamente'
      );
    });
  });

  describe('getAllOrders', () => {
    it('should get all orders for ADMIN', async () => {
      req.user.role = 'ADMIN';
      req.query = { page: 1, limit: 10 };
      const mockResult = {
        orders: [{ id: 'order-1' }],
        pagination: { total: 1 },
      };

      OrderService.getAllOrders = jest.fn().mockResolvedValue(mockResult);

      await OrderController.getAllOrders(req, res);

      expect(OrderService.getAllOrders).toHaveBeenCalledWith(
        'user-123',
        'ADMIN',
        req.query
      );
      expect(ApiResponse.paginated).toHaveBeenCalledWith(
        mockResult.orders,
        mockResult.pagination,
        'Órdenes obtenidas exitosamente'
      );
    });

    it('should get only user orders for CLIENT', async () => {
      req.query = {};
      const mockResult = {
        orders: [{ id: 'order-1', userId: 'user-123' }],
        pagination: { total: 1 },
      };

      OrderService.getAllOrders = jest.fn().mockResolvedValue(mockResult);

      await OrderController.getAllOrders(req, res);

      expect(OrderService.getAllOrders).toHaveBeenCalledWith(
        'user-123',
        'CLIENT',
        {}
      );
    });
  });

  describe('getOrderById', () => {
    it('should get order by id successfully', async () => {
      req.params.id = 'order-123';
      const mockOrder = { id: 'order-123', userId: 'user-123' };

      OrderService.getOrderById = jest.fn().mockResolvedValue(mockOrder);

      await OrderController.getOrderById(req, res);

      expect(OrderService.getOrderById).toHaveBeenCalledWith(
        'order-123',
        'user-123',
        'CLIENT'
      );
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockOrder,
        'Factura obtenida exitosamente'
      );
    });
  });

  describe('getUserOrderHistory', () => {
    it('should get user order history successfully', async () => {
      req.query = { page: 1 };
      const mockResult = {
        orders: [{ id: 'order-1' }],
        pagination: { total: 1 },
      };

      OrderService.getUserOrderHistory = jest.fn().mockResolvedValue(mockResult);

      await OrderController.getUserOrderHistory(req, res);

      expect(OrderService.getUserOrderHistory).toHaveBeenCalledWith(
        'user-123',
        req.query
      );
      expect(ApiResponse.paginated).toHaveBeenCalledWith(
        mockResult.orders,
        mockResult.pagination,
        'Historial de compras obtenido exitosamente'
      );
    });
  });

  describe('updateOrder', () => {
    it('should update order successfully', async () => {
      req.params.id = 'order-123';
      req.body = {
        items: [{ productId: 'product-1', quantity: 5 }],
      };
      const mockOrder = { id: 'order-123', status: 'PENDING' };

      OrderService.updateOrder = jest.fn().mockResolvedValue(mockOrder);

      await OrderController.updateOrder(req, res);

      expect(OrderService.updateOrder).toHaveBeenCalledWith(
        'order-123',
        'user-123',
        'CLIENT',
        req.body
      );
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockOrder,
        'Orden actualizada exitosamente'
      );
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order successfully', async () => {
      req.params.id = 'order-123';
      const mockOrder = { id: 'order-123', status: 'CANCELLED' };

      OrderService.cancelOrder = jest.fn().mockResolvedValue(mockOrder);

      await OrderController.cancelOrder(req, res);

      expect(OrderService.cancelOrder).toHaveBeenCalledWith(
        'order-123',
        'user-123',
        'CLIENT'
      );
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockOrder,
        'Orden cancelada exitosamente'
      );
    });
  });

  describe('completeOrder', () => {
    it('should complete order successfully', async () => {
      req.params.id = 'order-123';
      req.user.role = 'ADMIN';
      const mockOrder = { id: 'order-123', status: 'COMPLETED' };

      OrderService.completeOrder = jest.fn().mockResolvedValue(mockOrder);

      await OrderController.completeOrder(req, res);

      expect(OrderService.completeOrder).toHaveBeenCalledWith(
        'order-123',
        'user-123',
        'ADMIN'
      );
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockOrder,
        'Orden completada exitosamente'
      );
    });
  });
});
