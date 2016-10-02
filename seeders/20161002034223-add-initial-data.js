'use strict';
var data = require('./seed-data');

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Categories', data.categories.map(addTimestamps)).then(function() {
      return queryInterface.bulkInsert('Timeframes', data.timeframes.map(addTimestamps)).then(function() {
        return queryInterface.bulkInsert('BaseReminders', data.baseReminders.map(addTimestamps)).then(function() {
          return queryInterface.bulkInsert('BaseRemindersTimeframes', data.baseRemindersTimeframes.map(addTimestamps)).then(function() {
            return queryInterface.bulkInsert('Tests', data.tests.map(addTimestamps)).then(function() {
              return queryInterface.bulkInsert('TestDates', data.testDates.map(addTimestamps));
            })
          })
        })
      })
    })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('TestDates').then(function() {
      return queryInterface.bulkDelete('Tests').then(function() {
        return queryInterface.bulkDelete('BaseRemindersTimeframes').then(function() {
          return queryInterface.bulkDelete('BaseReminders').then(function() {
            return queryInterface.bulkDelete('Timeframes').then(function() {
              return queryInterface.bulkDelete('Categories');
            })
          })
        })
      })
    })
  }
};

function addTimestamps(record) {
  record.createdAt = new Date();
  record.updatedAt = new Date();
  return record;
}
