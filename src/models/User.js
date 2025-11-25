const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

/**
 * User Model
 * Represents users in the system with ADMIN or CLIENT roles
 */
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // User has many Orders
      User.hasMany(models.Order, {
        foreignKey: 'userId',
        as: 'orders',
        onDelete: 'CASCADE',
      });
    }

    /**
     * Compare password with hashed password
     * @param {string} candidatePassword - Password to compare
     * @returns {Promise<boolean>}
     */
    async comparePassword(candidatePassword) {
      return await bcrypt.compare(candidatePassword, this.password);
    }

    /**
     * Check if user is admin
     * @returns {boolean}
     */
    isAdmin() {
      return this.role === 'ADMIN';
    }

    /**
     * Check if user is client
     * @returns {boolean}
     */
    isClient() {
      return this.role === 'CLIENT';
    }

    /**
     * Get user's public profile (without password)
     * @returns {Object}
     */
    toJSON() {
      const values = { ...this.get() };
      delete values.password;
      return values;
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
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
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: {
          msg: 'El email ya está registrado',
        },
        validate: {
          notNull: { msg: 'El email es requerido' },
          notEmpty: { msg: 'El email no puede estar vacío' },
          isEmail: { msg: 'Debe ser un email válido' },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'La contraseña es requerida' },
          notEmpty: { msg: 'La contraseña no puede estar vacía' },
          len: {
            args: [6, 100],
            msg: 'La contraseña debe tener al menos 6 caracteres',
          },
        },
      },
      role: {
        type: DataTypes.ENUM('ADMIN', 'CLIENT'),
        allowNull: false,
        defaultValue: 'CLIENT',
        validate: {
          isIn: {
            args: [['ADMIN', 'CLIENT']],
            msg: 'El rol debe ser ADMIN o CLIENT',
          },
        },
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      hooks: {
        /**
         * Hash password before creating user
         */
        beforeCreate: async (user) => {
          if (user.password) {
            const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
            user.password = await bcrypt.hash(user.password, rounds);
          }
        },
        /**
         * Hash password before updating user if password changed
         */
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
            user.password = await bcrypt.hash(user.password, rounds);
          }
        },
      },
    }
  );

  return User;
};