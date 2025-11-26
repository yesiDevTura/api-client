const { Model } = require('sequelize');

/**
 * Order Model
 * Represents customer orders/purchases
 */
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // Order belongs to User
      Order.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });

      // Order has many OrderItems
      Order.hasMany(models.OrderItem, {
        foreignKey: 'orderId',
        as: 'items',
        onDelete: 'CASCADE',
      });
    }

    /**
     * Calculate total from order items
     * @returns {number}
     */
    calculateTotal() {
      if (!this.items || this.items.length === 0) {
        return 0;
      }
      return this.items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
    }

    /**
     * Get order with full details (items and products)
     * @returns {Object}
     */
    toInvoice() {
      return {
        id: this.id,
        orderDate: this.createdAt,
        total: parseFloat(this.total),
        user: this.user ? {
          id: this.user.id,
          name: this.user.name,
          email: this.user.email,
        } : null,
        items: this.items ? this.items.map(item => ({
          id: item.id,
          productId: item.productId,
          productName: item.product?.name,
          quantity: item.quantity,
          unitPrice: parseFloat(item.unitPrice),
          subtotal: parseFloat(item.subtotal),
        })) : [],
      };
    }
  }

  Order.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        validate: {
          notNull: { msg: 'El usuario es requerido' },
        },
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
          notNull: { msg: 'El total es requerido' },
          isDecimal: { msg: 'El total debe ser un número decimal' },
          min: {
            args: [0],
            msg: 'El total no puede ser negativo',
          },
        },
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'COMPLETED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'PENDING',
        validate: {
          notNull: { msg: 'El estado es requerido' },
          isIn: {
            args: [['PENDING', 'COMPLETED', 'CANCELLED']],
            msg: 'Estado inválido',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Order',
      tableName: 'orders',
      timestamps: true,
      indexes: [
        {
          fields: ['userId'],
        },
        {
          fields: ['createdAt'],
        },
        {
          fields: ['status'],
        },
      ],
    }
  );

  return Order;
};