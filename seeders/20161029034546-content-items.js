'use strict';
var data = require('./seed-data');

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('ContentItems', data.contentItems.map(addTimestamps));
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('ContentItems');
  }
};

function addTimestamps(record) {
  record.createdAt = new Date();
  record.updatedAt = new Date();
  return record;
}
