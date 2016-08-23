'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'Reminders',
      'userId',
      {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      }
    )
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('Reminders', 'userId');
  }
};
