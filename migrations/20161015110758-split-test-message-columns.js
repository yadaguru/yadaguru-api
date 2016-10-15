'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('Tests', 'registrationMessage', {
      allowNull: false,
      type: Sequelize.TEXT,
      defaultValue: ''
    }).then(function() {
      return queryInterface.addColumn('Tests', 'registrationDetail', {
        allowNull: false,
        type: Sequelize.TEXT,
        defaultValue: ''
      }).then(function() {
        return queryInterface.renameColumn('Tests', 'message', 'adminMessage').then(function() {
          return queryInterface.renameColumn('Tests', 'detail', 'adminDetail');
        })
      })
    })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.renameColumn('Tests', 'adminMessage', 'message').then(function() {
      return queryInterface.renameColumn('Tests', 'adminDetail', 'detail').then(function() {
        return queryInterface.removeColumn('Tests', 'registrationMessage').then(function() {
          return queryInterface.removeColumn('Tests', 'registrationDetail');
        })
      })
    })
  }
};
