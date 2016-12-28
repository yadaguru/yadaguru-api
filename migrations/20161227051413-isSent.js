'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('Reminders', 'isSent', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('Reminders', 'isSent');
  }
};
