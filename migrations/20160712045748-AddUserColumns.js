'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('Users', 'confirmCode', Sequelize.STRING).then(function() {
      return queryInterface.addColumn('Users', 'confirmCodeTimestamp', Sequelize.TIME).then(function() {
        return queryInterface.addColumn('Users', 'sponsorCode', Sequelize.STRING);
      });
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('Users', 'confirmCode').then(function() {
      return queryInterface.removeColumn('Users', 'confirmCodeTimestamp').then(function() {
        return queryInterface.removeColumn('Users', 'sponsorCode')
      });
    });
  }
};
