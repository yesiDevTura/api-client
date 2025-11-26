const { Product } = require('../models');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');
const { Op } = require('sequelize');

/**
 * Product Service Class
 */
class ProductService {
  /**
   * Create a new product
   */
  static async createProduct(productData) {
    try {
      // Check if lotNumber already exists (solo si se proporcionó)
      if (productData.lotNumber) {
        const existingProduct = await Product.findOne({
          where: { lotNumber: productData.lotNumber },
        });

        if (existingProduct) {
          throw AppError.conflict('El número de lote ya existe');
        }
      }

      // Create product (el hook beforeCreate generará lotNumber si no existe)
      const product = await Product.create(productData);

      logger.info(`Product created: ${product.id}`);
      return product;
    } catch (error) {
      logger.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Get all products with pagination and filters
   */
  static async getAllProducts(filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        minPrice,
        maxPrice,
        inStock,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
      } = filters;

      const offset = (page - 1) * limit;
      const where = {
        isActive: true, // Solo productos activos
      };

      // Search filter
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { lotNumber: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ];
      }

      // Price range filter
      if (minPrice !== undefined) {
        where.price = { ...where.price, [Op.gte]: minPrice };
      }
      if (maxPrice !== undefined) {
        where.price = { ...where.price, [Op.lte]: maxPrice };
      }

      // Stock filter
      if (inStock !== undefined) {
        where.stock = inStock ? { [Op.gt]: 0 } : 0;
      }

      const { rows: products, count: total } = await Product.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, sortOrder.toUpperCase()]],
      });

      return {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error getting products:', error);
      throw error;
    }
  }

  /**
   * Get product by ID
   */
  static async getProductById(id) {
    try {
      const product = await Product.findByPk(id);

      if (!product) {
        throw AppError.notFound('Producto');
      }

      return product;
    } catch (error) {
      logger.error(`Error getting product ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update product
   */
  static async updateProduct(id, updateData) {
    try {
      const product = await this.getProductById(id);

      // Check if lotNumber is being updated and already exists
      if (updateData.lotNumber && updateData.lotNumber !== product.lotNumber) {
        const existingProduct = await Product.findOne({
          where: {
            lotNumber: updateData.lotNumber,
            id: { [Op.ne]: id },
          },
        });

        if (existingProduct) {
          throw AppError.conflict('El número de lote ya existe');
        }
      }

      // Update product
      await product.update(updateData);

      logger.info(`Product updated: ${product.id}`);
      return product;
    } catch (error) {
      logger.error(`Error updating product ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete product (soft delete)
   */
  static async deleteProduct(id) {
    try {
      const product = await this.getProductById(id);

      // Soft delete: cambiar isActive a false
      await product.update({ isActive: false });

      logger.info(`Product soft deleted: ${id}`);
      return product;
    } catch (error) {
      logger.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  }

  /**
   * Add stock to product
   */
  static async addStock(id, quantity) {
    try {
      const product = await this.getProductById(id);

      await product.increaseStock(quantity);

      logger.info(`Stock added to product ${id}: +${quantity}`);
      return product;
    } catch (error) {
      logger.error(`Error adding stock to product ${id}:`, error);
      throw error;
    }
  }

  /**
   * Remove stock from product
   */
  static async removeStock(id, quantity) {
    try {
      const product = await this.getProductById(id);

      await product.decreaseStock(quantity);

      logger.info(`Stock removed from product ${id}: -${quantity}`);
      return product;
    } catch (error) {
      logger.error(`Error removing stock from product ${id}:`, error);
      throw error;
    }
  }
}

module.exports = ProductService;