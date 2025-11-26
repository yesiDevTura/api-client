const Joi = require('joi');

/**
 * Order Validator Class
 */
class OrderValidator {
  /**
   * Validation schema for creating an order
   */
  static create = Joi.object({
    items: Joi.array()
      .required()
      .min(1)
      .items(
        Joi.object({
          productId: Joi.string()
            .uuid()
            .required()
            .messages({
              'string.guid': 'El ID del producto debe ser un UUID válido',
              'any.required': 'El ID del producto es requerido',
            }),
          quantity: Joi.number()
            .required()
            .integer()
            .positive()
            .messages({
              'number.base': 'La cantidad debe ser un número',
              'number.integer': 'La cantidad debe ser un número entero',
              'number.positive': 'La cantidad debe ser mayor a 0',
              'any.required': 'La cantidad es requerida',
            }),
        })
      )
      .messages({
        'array.min': 'Debe incluir al menos un producto',
        'any.required': 'Los items son requeridos',
      }),
  });

  /**
   * Validation schema for order filters
   */
  static filters = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    userId: Joi.string().uuid().optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    sortBy: Joi.string().valid('createdAt', 'total').optional(),
    sortOrder: Joi.string().valid('ASC', 'DESC').optional(),
  });
}

module.exports = OrderValidator;