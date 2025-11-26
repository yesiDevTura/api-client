'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'status', {
      type: Sequelize.ENUM('PENDING', 'COMPLETED', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'PENDING',
    });

    await queryInterface.addIndex('orders', ['status'], {
      name: 'orders_status_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('orders', 'orders_status_idx');
    await queryInterface.removeColumn('orders', 'status');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_orders_status";');
  },
};