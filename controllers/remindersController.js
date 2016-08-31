var reminderService = require('../services/reminderService');
var remindersController = require('./baseController')('Reminder', reminderService);

remindersController.getAllForSchool = remindersController.makeGetAllForResourceFn('schoolId', 'findBySchool', 'getAllForSchool');

module.exports = remindersController;
