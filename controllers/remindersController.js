var reminderService = require('../services/reminderService');
var auth = require('../services/authService');
var errors = require('../services/errorService');

var requiredRoles = {
  getAllForUser: ['user'],
  getAllForSchoolForUser: ['user'],
  getByIdForUser: ['user']
};

var remindersController = require('./baseController')('Reminder', reminderService, null, requiredRoles);

remindersController.getAllForUser = function(req, res) {
  var userData = auth.getUserData(req.get('Bearer'));

  if (!userData || userData.role !== 'user') {
    res.status(401);
    res.json(new errors.NotAuthorizedError());
    return Promise.resolve();
  }

  var userId = userData.userId;

  return reminderService.findByUserWithBaseReminders(userId).then(function(reminders) {
    reminders = groupAndSortByDueDate(reminders);
    res.status(200);
    res.json(reminders);
  }).catch(function(error) {
    res.status(500);
    res.json(error);
  });
};

remindersController.getAllForSchoolForUser = function(req, res) {
  var userData = auth.getUserData(req.get('Bearer'));

  if (!userData || userData.role !== 'user') {
    res.status(401);
    res.json(new errors.NotAuthorizedError());
    return Promise.resolve();
  }

  var userId = userData.userId;
  var schoolId = req.params.id;

  return reminderService.findByUserForSchoolWithBaseReminders(schoolId, userId).then(function(reminders) {
    reminders = groupAndSortByDueDate(reminders);
    res.status(200);
    res.json(reminders);
  }).catch(function(error) {
    res.status(500);
    res.json(error);
  });
};

remindersController.getByIdForUser = function(req, res) {
  var userData = auth.getUserData(req.get('Bearer'));

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
    res.status(200);
    res.json(reminders);
  }).catch(function(error) {
    res.status(500);
    res.json(error);
  });
};



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

module.exports = remindersController;
