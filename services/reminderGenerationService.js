var baseReminderService = require('./baseReminderService');
var moment = require('moment');

module.exports = (function() {

  'use strict';

  function getRemindersForSchool(schoolId, userId, dueDate) {
    return baseReminderService.findAllIncludingTimeframes().then(function(baseReminders) {
      return baseReminders.reduce(function(allTimeframes, baseReminder) {
        return allTimeframes.concat(baseReminder.timeframes.map(function(timeframe) {
          timeframe.forBaseReminder = baseReminder.id;
          return timeframe;
        }));
      }, []).map(function(timeframe) {
        return {
          schoolId: schoolId,
          userId: userId,
          baseReminderId: timeframe.forBaseReminder,
          dueDate: _calculateDueDate(timeframe, dueDate),
          timeframe: timeframe.name
        }
      });
    });
  }

  function _calculateDueDate(timeframe, dueDate) {
    switch (timeframe.type) {
      case 'now':
        return moment().utc().format('YYYY-MM-DD');
      case 'relative':
        return moment.utc(dueDate).subtract(timeframe.formula, 'Days').format('YYYY-MM-DD');
      case 'absolute':
        return timeframe.formula;
      default:
        throw new Error('Invalid timeframe type: ' + timeframe.type);
    }
  }

  return {
    getRemindersForSchool: getRemindersForSchool
  }

})();
