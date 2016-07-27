'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('Categories', 'createdAt', {
      allowNull: false,
      type: Sequelize.DATE
    }).then(function() {
      return queryInterface.addColumn('Categories', 'updatedAt', {
        allowNull: false,
        type: Sequelize.DATE
      });
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('Categories', 'createdAt').then(function() {
      return queryInterface.removeColumn('Categories', 'updatedAt')
    });
  }
};
