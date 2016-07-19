'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.changeColumn('Users', 'phoneNumber', {
      type: Sequelize.STRING,
      unique: true
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.changeColumn('Users', 'phoneNumber', {
      type: Sequelize.INTEGER,
      unique: true
    });
  }
};
