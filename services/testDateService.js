var moment = require('moment');
var TestDate = require('../models/').TestDate;

var outputSanitizer = function(testDate) {
  testDate.adminDate = moment.utc(testDate.adminDate).format('YYYY-MM-DD');
  testDate.registrationDate = moment.utc(testDate.registrationDate).format('YYYY-MM-DD');
  return testDate;
};

var testDateService = require('./baseDbService')(TestDate, outputSanitizer);

testDateService.getTestDateReminders = function() {

};

module.exports = testDateService;
