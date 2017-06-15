'use strict';

var data = require('./seed-data.json');

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Categories', data.Categories)
      .then(function() {
        return queryInterface.bulkInsert('Timeframes', data.Timeframes);
      })
      .then(function() {
        return queryInterface.bulkInsert('BaseReminders', data.BaseReminders);
      })
      .then(function() {
        return queryInterface.bulkInsert('BaseRemindersTimeframes', data.BaseRemindersTimeframes);
      })
      .then(function() {
        return queryInterface.bulkInsert('Tests', data.Tests);
      })
      .then(function() {
        return queryInterface.bulkInsert('ContentItems', data.ContentItems);
      })
      .then(function() {
        return queryInterface.bulkInsert("AdminUsers", data.AdminUsers);
      })
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
