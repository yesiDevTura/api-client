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

    /**
     * Generate next lot number
     * @returns {Promise<string>}
     */
    static async generateLotNumber() {
      try {
        // Contar todos los productos para generar el siguiente número
        const count = await Product.count();
        const nextNumber = count + 1;
        return `LOT-${nextNumber.toString().padStart(4, '0')}`;
      } catch (error) {
        console.error('Error generating lot number:', error);
        // Fallback: genera un número aleatorio
        const random = Math.floor(Math.random() * 9999) + 1;
        return `LOT-${random.toString().padStart(4, '0')}`;
      }
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
        allowNull: true,
        unique: {
          msg: 'El número de lote ya existe',
        },
        validate: {
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
        allowNull: true,
        defaultValue: DataTypes.NOW,
        validate: {
          isDate: { msg: 'Debe ser una fecha válida' },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        validate: {
          notNull: { msg: 'El estado activo es requerido' },
        },
      },
    },
    {
      sequelize,
      modelName: 'Product',
      tableName: 'products',
      timestamps: true,
      hooks: {
        beforeCreate: async (product) => {
          if (!product.lotNumber) {
            product.lotNumber = await Product.generateLotNumber();
          }
        },
      },
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