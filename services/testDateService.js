var moment = require('moment');
var TestDate = require('../models/').TestDate;
var Test = require('../models/').Test;

var outputSanitizer = function(testDate) {
  testDate.adminDate = moment.utc(testDate.adminDate).format('YYYY-MM-DD');
  testDate.registrationDate = moment.utc(testDate.registrationDate).format('YYYY-MM-DD');
  return testDate;
};

var testDateService = require('./baseDbService')(TestDate, outputSanitizer);

testDateService.findAll = function() {
  return TestDate.findAll({
    include: Test
  }).then(function(rows) {
    return rows.map(function(row) {
      return {
        id: row.dataValues.id,
        testId: row.dataValues.testId,
        registrationDate: _formatDate(row.dataValues.registrationDate),
        adminDate: _formatDate(row.dataValues.adminDate),
        type: row.dataValues.Test.dataValues.type,
        registrationMessage: row.dataValues.Test.dataValues.registrationMessage,
        registrationDetail: row.dataValues.Test.dataValues.registrationDetail,
        adminMessage: row.dataValues.Test.dataValues.adminMessage,
        adminDetail: row.dataValues.Test.dataValues.adminDetail
      }
    });
  })
};

function _formatDate(date) {
  return moment.utc(date).format('YYYY-MM-DD');
}

module.exports = testDateService;
