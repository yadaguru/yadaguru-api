var env = process.env.NODE_ENV || 'development';
var config = require('../config/config.json')[env];
var reminderService = require('yadaguru-data')(config).reminderService;
var reminderGen = require('../services/reminderGenerationService');
var auth = require('../services/authService');
var errors = require('../services/errorService');
var moment = require('moment');

var requiredRoles = {
  getAllForUser: ['user'],
  getAllForSchoolForUser: ['user'],
  getByIdForUser: ['user']
};

var remindersController = require('./baseController')('Reminder', reminderService, null, requiredRoles);

remindersController.getAllForUser = function(req, res) {
  var userData = auth.getUserData(req.get('Authorization'));

  if (!userData || userData.role !== 'user') {
    res.status(401);
    res.json(new errors.NotAuthorizedError());
    return Promise.resolve();
  }

  var userId = userData.userId;

  return reminderService.findByUserWithBaseReminders(userId).then(function(reminders) {
    reminders = reminderGen.deDuplicateReminders(reminders);
    reminderGen.getTestReminders(moment.utc()).then(function(testReminders) {
      reminders = reminders.concat(testReminders);
      reminders = reminderGen.replaceVariablesInReminders(reminders);
      reminders = reminderGen.groupAndSortByDueDate(reminders);
      res.status(200);
      res.json(reminders);
    });
  }).catch(function(error) {
    res.status(500);
    res.json(error);
  });
};

remindersController.getAllForSchoolForUser = function(req, res) {
  var userData = auth.getUserData(req.get('Authorization'));

  if (!userData || userData.role !== 'user') {
    res.status(401);
    res.json(new errors.NotAuthorizedError());
    return Promise.resolve();
  }

  var userId = userData.userId;
  var schoolId = req.params.id;

  return reminderService.findByUserForSchoolWithBaseReminders(schoolId, userId).then(function(reminders) {
    reminderGen.getTestReminders(moment.utc()).then(function(testReminders) {
      reminders = reminders.concat(testReminders);
      reminders = reminderGen.replaceVariablesInReminders(reminders);
      if (reminders.length < 1) {
        res.status(200);
        res.json(reminders);
        return Promise.resolve();
      }
      var schoolName = reminders[0].schoolName;
      reminders = reminderGen.groupAndSortByDueDate(reminders);
      res.status(200);
      res.json({schoolName: schoolName, reminders: reminders});
    });
  }).catch(function(error) {
    res.status(500);
    res.json(error);
  });
};

remindersController.getByIdForUser = function(req, res) {
  var userData = auth.getUserData(req.get('Authorization'));

  if (!userData || userData.role !== 'user') {
    res.status(401);
    res.json(new errors.NotAuthorizedError());
    return Promise.resolve();
  }

  var userId = userData.userId;
  var reminderId = req.params.id;

  return reminderService.findByIdForUserWithBaseReminders(reminderId, userId).then(function(reminders) {
    if (reminders.length === 0) {
      res.status(404);
      res.json(new errors.ResourceNotFoundError('Reminder', reminderId));
      return Promise.resolve();
    }
    reminders = reminderGen.replaceVariablesInReminders(reminders);
    res.status(200);
    res.json(reminders);
  }).catch(function(error) {
    res.status(500);
    res.json(error);
  });
};

module.exports = remindersController;
