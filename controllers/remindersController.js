var reminderService = require('../services/reminderService');

var requiredRoles = {
  getAllForUser: ['user'],
  getAllForSchoolForUser: ['user'],
  getByIdForUser: ['user']
};

var remindersController = require('./baseController')('Reminder', reminderService, null, requiredRoles);

remindersController.getAllForSchoolForUser = remindersController.getAllForResourceForUser('School');

module.exports = remindersController;
