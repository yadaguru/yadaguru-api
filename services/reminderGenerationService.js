var baseReminderService = require('./baseReminderService');
var testDateService = require('./testDateService');
var moment = require('moment');

module.exports = (function() {

  'use strict';

  /**
   * @see http://momentjs.com/docs/#/displaying/
   */
  var DATE_FORMAT = 'M/D/Y';

  function _getDateFormatterForField(field) {
    return function(reminder, variable) {
      if (typeof reminder[field] !== 'undefined') {
        return moment.utc(reminder[field]).format(DATE_FORMAT);
      }
      return variable;
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

  function _sortBy(reminders, key) {
    reminders.sort(function(a, b) {
      if (a[key] > b[key]) {
        return 1;
      }
      if (a[key] < b[key]) {
        return -1;
      }
      return 0;
    });
  }

  function groupAndSortByDueDate(reminders) {
    _sortBy(reminders, 'dueDate');

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
        lateMessage: reminder.lateMessage || '',
        lateDetail: reminder.lateDetail || ''
      });

      return groupedReminders;
    }, []);
  }

  function replaceVariablesInReminders(reminders) {
    var fieldsToSearch = ['message', 'detail', 'lateMessage', 'lateDetail'];
    return reminders.map(function(reminder) {
      fieldsToSearch.forEach(function(field) {
        if (typeof reminder[field] !== 'undefined') {
          reminder[field] = _replaceVariables(reminder[field], reminder);
        }
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
          content = content.replace(re, field(reminder, variable));
        } else {
          if (typeof reminder[field] !== 'undefined') {
            content = content.replace(re, reminder[field]);
          }
        }
      }
    }
    return content;
  }

  function deDuplicateReminders(reminders) {
    _sortBy(reminders, 'baseReminderId');
    _sortBy(reminders, 'dueDate');

    var deDupedReminders = reminders.reduce(function(deDupedReminders, reminder) {
      if (deDupedReminders.length === 0) {
        deDupedReminders.push(reminder);
        return deDupedReminders;
      }

      var previousReminder = deDupedReminders[deDupedReminders.length - 1];
      if (previousReminder.dueDate === reminder.dueDate && previousReminder.baseReminderId === reminder.baseReminderId) {
        _mergeReminders(previousReminder, reminder);
        return deDupedReminders;
      }

      deDupedReminders.push(reminder);
      return deDupedReminders;
    }, []);

    return deDupedReminders.map(function(reminder) {
      if (Array.isArray(reminder.schoolName)) {
        reminder.schoolName = _concatenateSchoolNames(reminder.schoolName);
      }
      return reminder;
    });
  }

  function _mergeReminders(reminder1, reminder2) {
    reminder1.id = _mergeValues(reminder1.id, reminder2.id);
    reminder1.schoolId = _mergeValues(reminder1.schoolId, reminder2.schoolId);
    reminder1.schoolName = _mergeValues(reminder1.schoolName, reminder2.schoolName);
  }

  function _mergeValues(arrayOrString1, string2) {
    var array1 = Array.isArray(arrayOrString1) ? arrayOrString1 : [arrayOrString1];
    return array1.concat([string2]);
  }

  function _concatenateSchoolNames(schoolNames) {
    if (schoolNames.length === 2) {
      return schoolNames.join(' and ');
    }

    var lastSchool = schoolNames.pop();
    var firstSchools = schoolNames.join(', ');
    return firstSchools + ', and ' + lastSchool;
  }

  function getTestReminders(currentDate) {
    return testDateService.findAllWithTests().then(function(testDates) {
      var testDateReminders = testDates.reduce(function(testDateReminders, testDate) {
        if (moment(testDate.registrationDate).isSameOrAfter(currentDate)) {
          testDateReminders.push({
            id: testDate.id,
            dueDate: _formatDate(testDate.registrationDate),
            name: testDate.type + ' registration due today',
            message: testDate.registrationMessage,
            detail: testDate.registrationDetail,
            registrationDate: _formatDate(testDate.registrationDate),
            adminDate: _formatDate(testDate.adminDate)
          });
        }

        if (moment(testDate.adminDate).isSameOrAfter(currentDate)) {
          testDateReminders.push({
            id: testDate.id,
            dueDate: _formatDate(testDate.adminDate),
            name: testDate.type + ' test today',
            message: testDate.adminMessage,
            detail: testDate.adminDetail,
            registrationDate: _formatDate(testDate.registrationDate),
            adminDate: _formatDate(testDate.adminDate)
          });
        }

        return testDateReminders;
      }, []);

      _sortBy(testDateReminders, 'dueDate');
      return testDateReminders;
    });
  }

  function _formatDate(date) {
    return moment.utc(date).format('YYYY-MM-DD');
  }

  return {
    getRemindersForSchool: getRemindersForSchool,
    groupAndSortByDueDate: groupAndSortByDueDate,
    replaceVariablesInReminders: replaceVariablesInReminders,
    deDuplicateReminders: deDuplicateReminders,
    getTestReminders: getTestReminders
  }

})();
