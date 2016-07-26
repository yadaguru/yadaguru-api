'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable(
      'Categories', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        }
      }
    )
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('Categories');
  }
};
