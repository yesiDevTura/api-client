'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const now = new Date();

    await queryInterface.bulkInsert(
      'users',
      [
        {
          id: uuidv4(),
          name: 'Administrador',
          email: 'admin@inventory.com',
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: uuidv4(),
          name: 'Cliente Demo',
          email: 'cliente@inventory.com',
          password: hashedPassword, // Misma contraseña: admin123
          role: 'CLIENT',
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: ['admin@inventory.com', 'cliente@inventory.com'],
    });
  },
};
