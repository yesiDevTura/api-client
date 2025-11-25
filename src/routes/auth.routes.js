const express = require('express');
const AuthController = require('../controllers/AuthController');
const AuthValidator = require('../validators/AuthValidator');
const ValidationMiddleware = require('../middlewares/ValidationMiddleware');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

const router = express.Router();

/**
 * @api {post} /api/auth/register Register new user
 * @apiName Register
 * @apiGroup Auth
 * @apiBody {String} name User name (2-100 characters)
 * @apiBody {String} email User email
 * @apiBody {String} password User password (min 6 characters)
 * @apiBody {String="ADMIN","CLIENT"} [role=CLIENT] User role
 * @apiSuccess {Object} data User data and token
 * @apiSuccess {String} message Success message
 */
router.post(
  '/register',
  ValidationMiddleware.validate(AuthValidator.register()),
  AuthController.register
);

/**
 * @api {post} /api/auth/login Login user
 * @apiName Login
 * @apiGroup Auth
 * @apiBody {String} email User email
 * @apiBody {String} password User password
 * @apiSuccess {Object} data User data and token
 * @apiSuccess {String} message Success message
 */
router.post(
  '/login',
  ValidationMiddleware.validate(AuthValidator.login()),
  AuthController.login
);

/**
 * @api {get} /api/auth/me Get current user profile
 * @apiName GetProfile
 * @apiGroup Auth
 * @apiHeader {String} Authorization Bearer token
 * @apiSuccess {Object} data User profile data
 * @apiSuccess {String} message Success message
 */
router.get(
  '/me',
  AuthMiddleware.authenticate,
  AuthController.getProfile
);

module.exports = router;