const Joi = require('joi');

/**
 * Product Validator Class
 */
class ProductValidator {
  /**
   * Validation schema for creating a product
   */
  static create = Joi.object({
    lotNumber: Joi.string()
      .optional()
      .min(3)
      .max(50)
      .messages({
        'string.empty': 'El número de lote no puede estar vacío',
        'string.min': 'El número de lote debe tener al menos 3 caracteres',
        'string.max': 'El número de lote no puede exceder 50 caracteres',
      }),
    name: Joi.string()
      .required()
      .min(3)
      .max(100)
      .messages({
        'string.empty': 'El nombre es requerido',
        'string.min': 'El nombre debe tener al menos 3 caracteres',
        'string.max': 'El nombre no puede exceder 100 caracteres',
        'any.required': 'El nombre es requerido',
      }),
    price: Joi.number()
      .required()
      .positive()
      .precision(2)
      .messages({
        'number.base': 'El precio debe ser un número',
        'number.positive': 'El precio debe ser positivo',
        'any.required': 'El precio es requerido',
      }),
    stock: Joi.number()
      .required()
      .integer()
      .min(0)
      .messages({
        'number.base': 'El stock debe ser un número',
        'number.integer': 'El stock debe ser un número entero',
        'number.min': 'El stock no puede ser negativo',
        'any.required': 'El stock es requerido',
      }),
    entryDate: Joi.date()
      .optional()
      .messages({
        'date.base': 'La fecha de entrada debe ser una fecha válida',
      }),
    description: Joi.string()
      .optional()
      .max(500)
      .messages({
        'string.max': 'La descripción no puede exceder 500 caracteres',
      }),
  });

  /**
   * Validation schema for updating a product
   */
  static update = Joi.object({
    lotNumber: Joi.string()
      .optional()
      .min(3)
      .max(50)
      .messages({
        'string.min': 'El número de lote debe tener al menos 3 caracteres',
        'string.max': 'El número de lote no puede exceder 50 caracteres',
      }),
    name: Joi.string()
      .optional()
      .min(3)
      .max(100)
      .messages({
        'string.min': 'El nombre debe tener al menos 3 caracteres',
        'string.max': 'El nombre no puede exceder 100 caracteres',
      }),
    price: Joi.number()
      .optional()
      .positive()
      .precision(2)
      .messages({
        'number.base': 'El precio debe ser un número',
        'number.positive': 'El precio debe ser positivo',
      }),
    stock: Joi.number()
      .optional()
      .integer()
      .min(0)
      .messages({
        'number.base': 'El stock debe ser un número',
        'number.integer': 'El stock debe ser un número entero',
        'number.min': 'El stock no puede ser negativo',
      }),
    entryDate: Joi.date()
      .optional()
      .messages({
        'date.base': 'La fecha de entrada debe ser una fecha válida',
      }),
    description: Joi.string()
      .optional()
      .max(500)
      .messages({
        'string.max': 'La descripción no puede exceder 500 caracteres',
      }),
  }).min(1).messages({
    'object.min': 'Debe proporcionar al menos un campo para actualizar',
  });

  /**
   * Validation schema for updating stock
   */
  static updateStock = Joi.object({
    quantity: Joi.number()
      .required()
      .integer()
      .messages({
        'number.base': 'La cantidad debe ser un número',
        'number.integer': 'La cantidad debe ser un número entero',
        'any.required': 'La cantidad es requerida',
      }),
  });
}

module.exports = ProductValidator;