var moment = require('moment');
var Reminder = require('../models/').Reminder;

var outputSanitizer = function(reminder) {
  reminder.dueDate = moment.utc(reminder.dueDate).format('YYYY-MM-DD');
  return reminder;
};

var reminderService = require('./baseDbService')(Reminder, outputSanitizer);

module.exports = reminderService;
