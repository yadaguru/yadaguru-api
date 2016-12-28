'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('BaseReminders', 'smsMessage', {
      type: Sequelize.STRING
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('BaseReminders', 'smsMessage');
  }
};
