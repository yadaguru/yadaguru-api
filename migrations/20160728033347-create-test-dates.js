'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('TestDates', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      registrationDate: {
        allowNull: false,
        type: Sequelize.DATE
      },
      adminDate: {
        allowNull: false,
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      testId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Tests',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'restrict'
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('TestDates');
  }
};
