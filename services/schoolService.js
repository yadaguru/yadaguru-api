var moment = require('moment');
var School = require('../models/').School;

var outputSanitizer = function(school) {
  school.dueDate = moment.utc(school.dueDate).format('YYYY-MM-DD');
  return school;
};

var schoolService = require('./baseDbService')(School, outputSanitizer);

module.exports = schoolService;
