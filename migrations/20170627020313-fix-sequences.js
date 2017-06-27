'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('ALTER SEQUENCE "BaseReminders_id_seq" RESTART WITH 37;')
      .then(function() {
        return queryInterface.sequelize.query('ALTER SEQUENCE "Categories_id_seq" RESTART WITH 11;');
      })
      .then(function() {
        return queryInterface.sequelize.query('ALTER SEQUENCE "Timeframes_id_seq" RESTART WITH 15;');
      })
      .then(function() {
        return queryInterface.sequelize.query('ALTER SEQUENCE "AdminUsers_id_seq" RESTART WITH 2;');
      })
      .then(function() {
        return queryInterface.sequelize.query('ALTER SEQUENCE "Tests_id_seq" RESTART WITH 3;');
      })
      .then(function() {
        return queryInterface.sequelize.query('ALTER SEQUENCE "ContentItems_id_seq" RESTART WITH 16;');
      })
  },

  down: function (queryInterface, Sequelize) {
  }
};
