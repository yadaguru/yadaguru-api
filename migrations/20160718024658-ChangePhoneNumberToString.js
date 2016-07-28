'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.changeColumn('Users', 'phoneNumber', {
      type: Sequelize.STRING
    });
  },

  down: function (queryInterface, Sequelize) {

  }
};
