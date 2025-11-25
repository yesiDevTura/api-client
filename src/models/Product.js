const { Model } = require('sequelize');

/**
 * Product Model
 * Represents products in the inventory
 */
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // Product has many OrderItems
      Product.hasMany(models.OrderItem, {
        foreignKey: 'productId',
        as: 'orderItems',
      });
    }

    /**
     * Check if product has sufficient stock
     * @param {number} quantity - Quantity to check
     * @returns {boolean}
     */
    hasStock(quantity) {
      return this.stock >= quantity;
    }

    /**
     * Decrease product stock
     * @param {number} quantity - Quantity to decrease
     */
    async decreaseStock(quantity) {
      if (!this.hasStock(quantity)) {
        throw new Error(`Stock insuficiente para el producto ${this.name}`);
      }
      this.stock -= quantity;
      await this.save();
    }

    /**
     * Increase product stock
     * @param {number} quantity - Quantity to increase
     */
    async increaseStock(quantity) {
      this.stock += quantity;
      await this.save();
    }

    /**
     * Check if product is available
     * @returns {boolean}
     */
    isAvailable() {
      return this.stock > 0;
    }
  }

  Product.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      lotNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: {
          msg: 'El número de lote ya existe',
        },
        validate: {
          notNull: { msg: 'El número de lote es requerido' },
          notEmpty: { msg: 'El número de lote no puede estar vacío' },
        },
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notNull: { msg: 'El nombre es requerido' },
          notEmpty: { msg: 'El nombre no puede estar vacío' },
          len: {
            args: [2, 100],
            msg: 'El nombre debe tener entre 2 y 100 caracteres',
          },
        },
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          notNull: { msg: 'El precio es requerido' },
          isDecimal: { msg: 'El precio debe ser un número decimal' },
          min: {
            args: [0.01],
            msg: 'El precio debe ser mayor a 0',
          },
        },
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          notNull: { msg: 'La cantidad disponible es requerida' },
          isInt: { msg: 'La cantidad debe ser un número entero' },
          min: {
            args: [0],
            msg: 'La cantidad no puede ser negativa',
          },
        },
      },
      entryDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        validate: {
          notNull: { msg: 'La fecha de ingreso es requerida' },
          isDate: { msg: 'Debe ser una fecha válida' },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Product',
      tableName: 'products',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['lotNumber'],
        },
        {
          fields: ['name'],
        },
        {
          fields: ['entryDate'],
        },
      ],
    }
  );

  return Product;
};