const { Model } = require('sequelize');

/**
 * OrderItem Model
 * Represents individual items in an order
 */
module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // OrderItem belongs to Order
      OrderItem.belongsTo(models.Order, {
        foreignKey: 'orderId',
        as: 'order',
      });

      // OrderItem belongs to Product
      OrderItem.belongsTo(models.Product, {
        foreignKey: 'productId',
        as: 'product',
      });
    }

    /**
     * Calculate subtotal
     * @returns {number}
     */
    calculateSubtotal() {
      return parseFloat(this.unitPrice) * this.quantity;
    }
  }

  OrderItem.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      orderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id',
        },
        onDelete: 'CASCADE',
        validate: {
          notNull: { msg: 'La orden es requerida' },
        },
      },
      productId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
        onDelete: 'RESTRICT',
        validate: {
          notNull: { msg: 'El producto es requerido' },
        },
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: 'La cantidad es requerida' },
          isInt: { msg: 'La cantidad debe ser un número entero' },
          min: {
            args: [1],
            msg: 'La cantidad debe ser al menos 1',
          },
        },
      },
      unitPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          notNull: { msg: 'El precio unitario es requerido' },
          isDecimal: { msg: 'El precio unitario debe ser un número decimal' },
          min: {
            args: [0.01],
            msg: 'El precio unitario debe ser mayor a 0',
          },
        },
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          notNull: { msg: 'El subtotal es requerido' },
          isDecimal: { msg: 'El subtotal debe ser un número decimal' },
          min: {
            args: [0.01],
            msg: 'El subtotal debe ser mayor a 0',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'OrderItem',
      tableName: 'order_items',
      timestamps: true,
      hooks: {
        /**
         * Calculate subtotal before creating
         */
        beforeValidate: (orderItem) => {
          if (orderItem.unitPrice && orderItem.quantity) {
            orderItem.subtotal = orderItem.calculateSubtotal();
          }
        },
      },
      indexes: [
        {
          fields: ['orderId'],
        },
        {
          fields: ['productId'],
        },
      ],
    }
  );

  return OrderItem;
};