var baseReminderService = require('./baseReminderService');
var moment = require('moment');

module.exports = (function() {

  'use strict';

  /**
   * @see http://momentjs.com/docs/#/displaying/
   */
  var DATE_FORMAT = 'M/D/Y';

  function _getDateFormatterForField(field) {
    return function(reminder) {
      return moment.utc(reminder[field]).format(DATE_FORMAT);
    }
  }

  var VARIABLES = {
    '%SCHOOL%': 'schoolName',
    '%DATE%': _getDateFormatterForField('schoolDueDate'),
    '%APPLICATION_DATE%': _getDateFormatterForField('schoolDueDate'),
    '%REMINDER_DATE%': _getDateFormatterForField('dueDate'),
    '%REGISTRATION_DATE%': _getDateFormatterForField('registrationDate'),
    '%ADMIN_DATE%': _getDateFormatterForField('adminDate')
  };


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

  function groupAndSortByDueDate(reminders) {
    reminders.sort(function(a, b) {
      if (a.dueDate > b.dueDate) {
        return 1;
      }
      if (a.dueDate < b.dueDate) {
        return -1;
      }
      return 0;
    });

    return reminders.reduce(function(groupedReminders, reminder) {
      var currentGroup = false;

      for (var i = 0; i < groupedReminders.length; i++) {
        if (groupedReminders[i].dueDate === reminder.dueDate) {
          currentGroup = groupedReminders[i];
          break;
        }
      }

      if (!currentGroup) {
        currentGroup = {
          dueDate: reminder.dueDate,
          reminders: []
        };
        groupedReminders.push(currentGroup);
      }

      currentGroup.reminders.push({
        id: reminder.id,
        name: reminder.name,
        message: reminder.message,
        detail: reminder.detail,
        lateMessage: reminder.lateMessage,
        lateDetail: reminder.lateDetail,
        category: reminder.category,
        timeframe: reminder.timeframe
      });

      return groupedReminders;
    }, []);
  }

  function replaceVariablesInReminders(reminders) {
    var fieldsToSearch = ['message', 'detail', 'lateMessage', 'lateDetail'];
    return reminders.map(function(reminder) {
      fieldsToSearch.forEach(function(field) {
        reminder[field] = _replaceVariables(reminder[field], reminder);
      });
      return reminder;
    });
  }

  function _replaceVariables(content, reminder) {
    for (var variable in VARIABLES) {
      if (VARIABLES.hasOwnProperty(variable)) {
        var field = VARIABLES[variable];
        var re = new RegExp(variable, 'g');
        if (typeof field === 'function') {
          content = content.replace(re, field(reminder))
        } else {
          content = content.replace(re, reminder[field]);
        }
      }
    }
    return content;
  }

  return {
    getRemindersForSchool: getRemindersForSchool,
    groupAndSortByDueDate: groupAndSortByDueDate,
    replaceVariablesInReminders: replaceVariablesInReminders
  }

})();
