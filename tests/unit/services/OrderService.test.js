const OrderService = require('../../../src/services/OrderService');
const { Order, OrderItem, Product, User, sequelize } = require('../../../src/models');
const AppError = require('../../../src/utils/AppError');

// Mock dependencies
jest.mock('../../../src/models');
jest.mock('../../../src/config/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe('OrderService', () => {
  let mockTransaction;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock transaction
    mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };
    sequelize.transaction = jest.fn().mockResolvedValue(mockTransaction);
  });

  describe('createOrder', () => {
    const userId = 'user-123';
    const orderData = {
      items: [
        { productId: 'product-1', quantity: 2 },
        { productId: 'product-2', quantity: 1 },
      ],
    };

    it('should create order successfully with valid data', async () => {
      const mockProduct1 = {
        id: 'product-1',
        name: 'Laptop',
        price: '1000.00',
        stock: 10,
        isActive: true,
        update: jest.fn().mockResolvedValue(true),
      };
      const mockProduct2 = {
        id: 'product-2',
        name: 'Mouse',
        price: '50.00',
        stock: 5,
        isActive: true,
        update: jest.fn().mockResolvedValue(true),
      };
      const mockOrder = { id: 'order-123', userId, total: 2050 };

      Product.findByPk = jest.fn()
        .mockResolvedValueOnce(mockProduct1)
        .mockResolvedValueOnce(mockProduct2);
      Order.create = jest.fn().mockResolvedValue(mockOrder);
      OrderItem.create = jest.fn().mockResolvedValue(true);
      
      // Use spy instead of mock to not affect other tests
      const getOrderByIdSpy = jest.spyOn(OrderService, 'getOrderById').mockResolvedValue(mockOrder);

      const result = await OrderService.createOrder(userId, orderData);
      
      getOrderByIdSpy.mockRestore();

      expect(Product.findByPk).toHaveBeenCalledTimes(2);
      expect(mockProduct1.update).toHaveBeenCalledWith(
        { stock: 8 },
        { transaction: mockTransaction }
      );
      expect(mockProduct2.update).toHaveBeenCalledWith(
        { stock: 4 },
        { transaction: mockTransaction }
      );
      expect(Order.create).toHaveBeenCalledWith(
        { userId, total: 2050 },
        { transaction: mockTransaction }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual(mockOrder);
    });

    it('should throw error if product not found', async () => {
      Product.findByPk = jest.fn().mockResolvedValue(null);

      await expect(OrderService.createOrder(userId, orderData)).rejects.toThrow(
        'Producto con ID product-1'
      );
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw error if product is not active', async () => {
      const mockProduct = {
        id: 'product-1',
        name: 'Laptop',
        isActive: false,
      };
      Product.findByPk = jest.fn().mockResolvedValue(mockProduct);

      await expect(OrderService.createOrder(userId, orderData)).rejects.toThrow(
        'no está disponible'
      );
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw error if insufficient stock', async () => {
      const mockProduct = {
        id: 'product-1',
        name: 'Laptop',
        price: '1000.00',
        stock: 1,
        isActive: true,
      };
      Product.findByPk = jest.fn().mockResolvedValue(mockProduct);

      await expect(OrderService.createOrder(userId, orderData)).rejects.toThrow(
        'Stock insuficiente'
      );
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('getAllOrders', () => {
    it('should return all orders for ADMIN', async () => {
      const mockOrders = [
        { id: 'order-1', userId: 'user-1', toInvoice: jest.fn().mockReturnValue({ id: 'order-1' }) },
        { id: 'order-2', userId: 'user-2', toInvoice: jest.fn().mockReturnValue({ id: 'order-2' }) },
      ];
      Order.findAndCountAll = jest.fn().mockResolvedValue({
        rows: mockOrders,
        count: 2,
      });

      const result = await OrderService.getAllOrders('admin-id', 'ADMIN', {});

      expect(Order.findAndCountAll).toHaveBeenCalled();
      expect(result.orders).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });

    it('should return only user orders for CLIENT', async () => {
      const userId = 'user-123';
      const mockOrders = [
        { id: 'order-1', userId, toInvoice: jest.fn().mockReturnValue({ id: 'order-1' }) },
      ];
      Order.findAndCountAll = jest.fn().mockResolvedValue({
        rows: mockOrders,
        count: 1,
      });

      await OrderService.getAllOrders(userId, 'CLIENT', {});

      expect(Order.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId }),
        })
      );
    });

    it('should apply pagination correctly', async () => {
      Order.findAndCountAll = jest.fn().mockResolvedValue({ rows: [], count: 0 });

      await OrderService.getAllOrders('admin-id', 'ADMIN', { page: 2, limit: 5 });

      expect(Order.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 5,
          offset: 5,
        })
      );
    });
  });

  describe('getOrderById', () => {
    const orderId = 'order-123';
    const userId = 'user-123';

    it('should return order for authorized CLIENT', async () => {
      const mockOrder = {
        id: orderId,
        userId,
        toInvoice: jest.fn().mockReturnValue({ id: orderId }),
      };
      Order.findByPk = jest.fn().mockResolvedValue(mockOrder);

      const result = await OrderService.getOrderById(orderId, userId, 'CLIENT');

      expect(Order.findByPk).toHaveBeenCalledWith(orderId, expect.any(Object));
      expect(mockOrder.toInvoice).toHaveBeenCalled();
    });

    it('should throw error if order not found', async () => {
      Order.findByPk = jest.fn().mockResolvedValue(null);

      await expect(OrderService.getOrderById(orderId, userId, 'CLIENT')).rejects.toThrow(
        'Orden'
      );
    });

    it('should throw forbidden error if CLIENT tries to access other user order', async () => {
      const mockOrder = {
        id: orderId,
        userId: 'other-user',
      };
      Order.findByPk = jest.fn().mockResolvedValue(mockOrder);

      await expect(
        OrderService.getOrderById(orderId, userId, 'CLIENT')
      ).rejects.toThrow('No tienes permiso');
    });

    it('should allow ADMIN to access any order', async () => {
      const mockOrder = {
        id: orderId,
        userId: 'other-user',
        toInvoice: jest.fn().mockReturnValue({ id: orderId }),
      };
      Order.findByPk = jest.fn().mockResolvedValue(mockOrder);

      await OrderService.getOrderById(orderId, 'admin-id', 'ADMIN');

      expect(mockOrder.toInvoice).toHaveBeenCalled();
    });
  });

  describe('getUserOrderHistory', () => {
    it('should call getAllOrders with CLIENT role', async () => {
      const getAllOrdersSpy = jest.spyOn(OrderService, 'getAllOrders').mockResolvedValue({ orders: [], pagination: {} });

      await OrderService.getUserOrderHistory('user-123', {});

      expect(getAllOrdersSpy).toHaveBeenCalledWith('user-123', 'CLIENT', {});
      
      getAllOrdersSpy.mockRestore();
    });
  });

  describe('updateOrder', () => {
    const orderId = 'order-123';
    const userId = 'user-123';
    const updateData = {
      items: [{ productId: 'product-1', quantity: 3 }],
    };

    it('should update PENDING order successfully', async () => {
      const mockOldItem = { productId: 'product-1', quantity: 2 };
      const mockOrder = {
        id: orderId,
        userId,
        status: 'PENDING',
        items: [mockOldItem],
        update: jest.fn().mockResolvedValue(true),
      };
      const mockProduct = {
        id: 'product-1',
        name: 'Laptop',
        price: '1000.00',
        stock: 5,
        isActive: true,
        update: jest.fn().mockResolvedValue(true),
      };

      Order.findByPk = jest.fn().mockResolvedValue(mockOrder);
      Product.findByPk = jest.fn().mockResolvedValue(mockProduct);
      OrderItem.destroy = jest.fn().mockResolvedValue(true);
      OrderItem.create = jest.fn().mockResolvedValue(true);
      
      const getOrderByIdSpy = jest.spyOn(OrderService, 'getOrderById').mockResolvedValue(mockOrder);

      await OrderService.updateOrder(orderId, userId, 'CLIENT', updateData);
      
      getOrderByIdSpy.mockRestore();

      expect(mockOrder.update).toHaveBeenCalledWith({ total: 3000 }, { transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should throw error if order not PENDING', async () => {
      const mockOrder = {
        id: orderId,
        userId,
        status: 'COMPLETED',
      };
      Order.findByPk = jest.fn().mockResolvedValue(mockOrder);

      await expect(
        OrderService.updateOrder(orderId, userId, 'CLIENT', updateData)
      ).rejects.toThrow('No se puede modificar');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw forbidden if CLIENT tries to update other user order', async () => {
      const mockOrder = {
        id: orderId,
        userId: 'other-user',
        status: 'PENDING',
      };
      Order.findByPk = jest.fn().mockResolvedValue(mockOrder);

      await expect(
        OrderService.updateOrder(orderId, userId, 'CLIENT', updateData)
      ).rejects.toThrow('No tienes permiso');
    });
  });

  describe('cancelOrder', () => {
    const orderId = 'order-123';
    const userId = 'user-123';

    it('should cancel PENDING order and return stock', async () => {
      const mockItem = { productId: 'product-1', quantity: 2 };
      const mockOrder = {
        id: orderId,
        userId,
        status: 'PENDING',
        items: [mockItem],
        update: jest.fn().mockResolvedValue(true),
      };
      const mockProduct = {
        id: 'product-1',
        stock: 5,
        update: jest.fn().mockResolvedValue(true),
      };

      Order.findByPk = jest.fn().mockResolvedValue(mockOrder);
      Product.findByPk = jest.fn().mockResolvedValue(mockProduct);
      
      const getOrderByIdSpy = jest.spyOn(OrderService, 'getOrderById').mockResolvedValue(mockOrder);

      await OrderService.cancelOrder(orderId, userId, 'CLIENT');
      
      getOrderByIdSpy.mockRestore();

      expect(mockProduct.update).toHaveBeenCalledWith(
        { stock: 7 },
        { transaction: mockTransaction }
      );
      expect(mockOrder.update).toHaveBeenCalledWith(
        { status: 'CANCELLED' },
        { transaction: mockTransaction }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should throw error if order not PENDING', async () => {
      const mockOrder = {
        id: orderId,
        userId,
        status: 'CANCELLED',
      };
      Order.findByPk = jest.fn().mockResolvedValue(mockOrder);

      await expect(
        OrderService.cancelOrder(orderId, userId, 'CLIENT')
      ).rejects.toThrow('No se puede cancelar');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('completeOrder', () => {
    const orderId = 'order-123';
    const userId = 'admin-123';

    it('should complete PENDING order successfully', async () => {
      const mockOrder = {
        id: orderId,
        status: 'PENDING',
        update: jest.fn().mockResolvedValue(true),
      };

      Order.findByPk = jest.fn().mockResolvedValue(mockOrder);
      
      const getOrderByIdSpy = jest.spyOn(OrderService, 'getOrderById').mockResolvedValue(mockOrder);

      await OrderService.completeOrder(orderId, userId, 'ADMIN');
      
      getOrderByIdSpy.mockRestore();

      expect(mockOrder.update).toHaveBeenCalledWith({ status: 'COMPLETED' });
    });

    it('should throw error if order not PENDING', async () => {
      const mockOrder = {
        id: orderId,
        status: 'COMPLETED',
      };
      Order.findByPk = jest.fn().mockResolvedValue(mockOrder);

      await expect(
        OrderService.completeOrder(orderId, userId, 'ADMIN')
      ).rejects.toThrow('No se puede completar');
    });

    it('should throw error if order not found', async () => {
      Order.findByPk = jest.fn().mockResolvedValue(null);

      await expect(
        OrderService.completeOrder(orderId, userId, 'ADMIN')
      ).rejects.toThrow('Orden');
    });
  });
});
