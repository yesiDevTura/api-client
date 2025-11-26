'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'isActive', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    // Agregar índice para mejorar consultas
    await queryInterface.addIndex('products', ['isActive'], {
      name: 'products_isActive_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('products', 'products_isActive_idx');
    await queryInterface.removeColumn('products', 'isActive');
  },
};