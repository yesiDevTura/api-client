const { Order, OrderItem, Product, User } = require('../models');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');
const { Op } = require('sequelize');
const { sequelize } = require('../models');

/**
 * Order Service Class
 */
class OrderService {

      /**
   * Complete order (ADMIN only)
   */
  static async completeOrder(orderId, userId, userRole) {
    try {
      const order = await Order.findByPk(orderId);

      if (!order) {
        throw AppError.notFound('Orden');
      }

      // Only PENDING orders can be completed
      if (order.status !== 'PENDING') {
        throw AppError.badRequest(
          `No se puede completar una orden con estado ${order.status}`
        );
      }

      // Update order status
      await order.update({ status: 'COMPLETED' });

      logger.info(`Order completed: ${order.id} by admin ${userId}`);

      return await this.getOrderById(order.id, userId, userRole);
    } catch (error) {
      logger.error('Error completing order:', error);
      throw error;
    }
  }
  /**
   * Create a new order
   */
  static async createOrder(userId, orderData) {
    const transaction = await sequelize.transaction();

    try {
      const { items } = orderData;

      // Validate and calculate total
      let total = 0;
      const orderItems = [];

      for (const item of items) {
        // Get product
        const product = await Product.findByPk(item.productId, { transaction });

        if (!product) {
          throw AppError.notFound(`Producto con ID ${item.productId}`);
        }

        if (!product.isActive) {
          throw AppError.badRequest(`El producto ${product.name} no está disponible`);
        }

        // Check stock
        if (product.stock < item.quantity) {
          throw AppError.badRequest(
            `Stock insuficiente para ${product.name}. Disponible: ${product.stock}`
          );
        }

        // Calculate subtotal
        const unitPrice = parseFloat(product.price);
        const subtotal = unitPrice * item.quantity;
        total += subtotal;

        // Prepare order item
        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice,
          subtotal,
        });

        // Reduce product stock
        await product.update(
          { stock: product.stock - item.quantity },
          { transaction }
        );
      }

      // Create order
      const order = await Order.create(
        {
          userId,
          total,
        },
        { transaction }
      );

      // Create order items
      for (const item of orderItems) {
        await OrderItem.create(
          {
            orderId: order.id,
            ...item,
          },
          { transaction }
        );
      }

      await transaction.commit();

      // Return order with details
      const createdOrder = await this.getOrderById(order.id, userId, 'CLIENT');
      logger.info(`Order created: ${order.id} by user ${userId}`);

      return createdOrder;
    } catch (error) {
      await transaction.rollback();
      logger.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Get all orders (ADMIN) or user orders (CLIENT)
   */
  static async getAllOrders(userId, userRole, filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        userId: filterUserId,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
      } = filters;

      const offset = (page - 1) * limit;
      const where = {};

      // If CLIENT, only show their orders
      if (userRole === 'CLIENT') {
        where.userId = userId;
      }

      // If ADMIN and filtering by user
      if (userRole === 'ADMIN' && filterUserId) {
        where.userId = filterUserId;
      }

      // Date filters
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          where.createdAt[Op.lte] = new Date(endDate);
        }
      }

      const { rows: orders, count: total } = await Order.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, sortOrder.toUpperCase()]],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email'],
          },
          {
            model: OrderItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'lotNumber'],
              },
            ],
          },
        ],
      });

      return {
        orders: orders.map(order => order.toInvoice()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error getting orders:', error);
      throw error;
    }
  }

  /**
   * Get order by ID (with authorization check)
   */
  static async getOrderById(orderId, userId, userRole) {
    try {
      const order = await Order.findByPk(orderId, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email'],
          },
          {
            model: OrderItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'lotNumber', 'price'],
              },
            ],
          },
        ],
      });

      if (!order) {
        throw AppError.notFound('Orden');
      }

      // Authorization: CLIENT can only see their own orders
      if (userRole === 'CLIENT' && order.userId !== userId) {
        throw AppError.forbidden('No tienes permiso para ver esta orden');
      }

      return order.toInvoice();
    } catch (error) {
      logger.error(`Error getting order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Get user order history (CLIENT)
   */
  static async getUserOrderHistory(userId, filters = {}) {
    try {
      return await this.getAllOrders(userId, 'CLIENT', filters);
    } catch (error) {
      logger.error(`Error getting order history for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update order (only PENDING orders)
   */
  static async updateOrder(orderId, userId, userRole, updateData) {
    const transaction = await sequelize.transaction();

    try {
      // Get existing order
      const order = await Order.findByPk(orderId, {
        include: [
          {
            model: OrderItem,
            as: 'items',
          },
        ],
        transaction,
      });

      if (!order) {
        throw AppError.notFound('Orden');
      }

      // Authorization: CLIENT can only update their own orders
      if (userRole === 'CLIENT' && order.userId !== userId) {
        throw AppError.forbidden('No tienes permiso para modificar esta orden');
      }

      // Only PENDING orders can be updated
      if (order.status !== 'PENDING') {
        throw AppError.badRequest(
          `No se puede modificar una orden con estado ${order.status}`
        );
      }

      // Return stock of old items
      for (const item of order.items) {
        const product = await Product.findByPk(item.productId, { transaction });
        if (product) {
          await product.update(
            { stock: product.stock + item.quantity },
            { transaction }
          );
        }
      }

      // Delete old items
      await OrderItem.destroy({ where: { orderId }, transaction });

      // Process new items
      const { items } = updateData;
      let total = 0;
      const newOrderItems = [];

      for (const item of items) {
        const product = await Product.findByPk(item.productId, { transaction });

        if (!product) {
          throw AppError.notFound(`Producto con ID ${item.productId}`);
        }

        if (!product.isActive) {
          throw AppError.badRequest(`El producto ${product.name} no está disponible`);
        }

        if (product.stock < item.quantity) {
          throw AppError.badRequest(
            `Stock insuficiente para ${product.name}. Disponible: ${product.stock}`
          );
        }

        const unitPrice = parseFloat(product.price);
        const subtotal = unitPrice * item.quantity;
        total += subtotal;

        newOrderItems.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice,
          subtotal,
        });

        await product.update(
          { stock: product.stock - item.quantity },
          { transaction }
        );
      }

      // Update order total
      await order.update({ total }, { transaction });

      // Create new items
      for (const item of newOrderItems) {
        await OrderItem.create(
          {
            orderId: order.id,
            ...item,
          },
          { transaction }
        );
      }

      await transaction.commit();

      // Return updated order
      const updatedOrder = await this.getOrderById(order.id, userId, userRole);
      logger.info(`Order updated: ${order.id}`);

      return updatedOrder;
    } catch (error) {
      await transaction.rollback();
      logger.error('Error updating order:', error);
      throw error;
    }
  }

  /**
   * Cancel order (returns stock)
   */
  static async cancelOrder(orderId, userId, userRole) {
    const transaction = await sequelize.transaction();

    try {
      const order = await Order.findByPk(orderId, {
        include: [
          {
            model: OrderItem,
            as: 'items',
          },
        ],
        transaction,
      });

      if (!order) {
        throw AppError.notFound('Orden');
      }

      // Authorization: CLIENT can only cancel their own orders
      if (userRole === 'CLIENT' && order.userId !== userId) {
        throw AppError.forbidden('No tienes permiso para cancelar esta orden');
      }

      // Only PENDING orders can be cancelled
      if (order.status !== 'PENDING') {
        throw AppError.badRequest(
          `No se puede cancelar una orden con estado ${order.status}`
        );
      }

      // Return stock to products
      for (const item of order.items) {
        const product = await Product.findByPk(item.productId, { transaction });
        if (product) {
          await product.update(
            { stock: product.stock + item.quantity },
            { transaction }
          );
        }
      }

      // Update order status
      await order.update({ status: 'CANCELLED' }, { transaction });

      await transaction.commit();

      logger.info(`Order cancelled: ${order.id}`);

      return await this.getOrderById(order.id, userId, userRole);
    } catch (error) {
      await transaction.rollback();
      logger.error('Error cancelling order:', error);
      throw error;
    }
  }
}

module.exports = OrderService;