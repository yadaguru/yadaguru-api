var moment = require('moment');
var TestDate = require('../models/').TestDate;
var Test = require('../models/').Test;

var outputSanitizer = function(testDate) {
  testDate.adminDate = moment.utc(testDate.adminDate).format('YYYY-MM-DD');
  testDate.registrationDate = moment.utc(testDate.registrationDate).format('YYYY-MM-DD');
  return testDate;
};

var testDateService = require('./baseDbService')(TestDate, outputSanitizer);

testDateService.findAllWithTests = function() {
  return TestDate.findAll({
    include: Test
  }).then(function(rows) {
    return rows.map(function(row) {
      return {
        id: row.dataValues.id,
        testId: row.dataValues.testId,
        registrationDate: row.dataValues.registrationDate,
        adminDate: row.dataValues.adminDate,
        type: row.dataValues.Test.dataValues.type,
        registrationMessage: row.dataValues.Test.dataValues.registrationMessage,
        registrationDetail: row.dataValues.Test.dataValues.registrationDetail,
        adminMessage: row.dataValues.Test.dataValues.adminMessage,
        adminDetail: row.dataValues.Test.dataValues.adminDetail
      }
    });
  })
};

module.exports = testDateService;
