'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Reminders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      timeframe: {
        allowNull: false,
        type: Sequelize.STRING
      },
      dueDate: {
        allowNull: false,
        type: Sequelize.DATE
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      message: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      detail: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      lateMessage: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      lateDetail: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      schoolId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Schools',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Reminders');
  }
};
