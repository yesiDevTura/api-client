const Joi = require('joi');

/**
 * Auth Validator Class
 * Validates authentication requests using Joi
 */
class AuthValidator {
  /**
   * Validate register request
   */
  static register() {
    return Joi.object({
      name: Joi.string().min(2).max(100).required().messages({
        'string.empty': 'El nombre es requerido',
        'string.min': 'El nombre debe tener al menos 2 caracteres',
        'string.max': 'El nombre no puede exceder 100 caracteres',
        'any.required': 'El nombre es requerido',
      }),
      email: Joi.string().email().required().messages({
        'string.empty': 'El email es requerido',
        'string.email': 'Debe ser un email válido',
        'any.required': 'El email es requerido',
      }),
      password: Joi.string().min(6).required().messages({
        'string.empty': 'La contraseña es requerida',
        'string.min': 'La contraseña debe tener al menos 6 caracteres',
        'any.required': 'La contraseña es requerida',
      }),
      role: Joi.string().valid('ADMIN', 'CLIENT').default('CLIENT').messages({
        'any.only': 'El rol debe ser ADMIN o CLIENT',
      }),
    });
  }

  /**
   * Validate login request
   */
  static login() {
    return Joi.object({
      email: Joi.string().email().required().messages({
        'string.empty': 'El email es requerido',
        'string.email': 'Debe ser un email válido',
        'any.required': 'El email es requerido',
      }),
      password: Joi.string().required().messages({
        'string.empty': 'La contraseña es requerida',
        'any.required': 'La contraseña es requerida',
      }),
    });
  }
}

module.exports = AuthValidator;