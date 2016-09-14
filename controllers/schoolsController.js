var schoolService = require('../services/schoolService');
var auth = require('../services/authService');
var errors = require('../services/errorService');
var reminderGen = require('../services/reminderGenerationService');
var reminderService = require('../services/reminderService');
var validators = require('../services/validatorService');

var schema = {
  name: {
    required: true
  },
  dueDate: {
    required: true,
    rules: [{
      validator: 'isDate',
      message: 'must be a date'
    }]
  },
  isActive: {
    rules: [{
      validator: 'isBoolean',
      message:'must be true or false'
     }]
  }
};

var requiredRoles = {
  getAllForUser: ['user'],
  postForUser: ['user'],
  getByIdForUser: ['user'],
  putOnIdForUser: ['user'],
  removeByIdForUser: ['user']
};

var schoolsController = require('./baseController')('School', schoolService, schema, requiredRoles);

schoolsController.postForUser = function(req, res) {
  var userData = auth.getUserData(req.get('Bearer'));
  if (!userData || userData.role !== 'user') {
    res.status(401);
    res.json(new errors.NotAuthorizedError());
    return Promise.resolve();
  }

  var validation = validators.sanitizeAndValidate(req.body, schema, true);

  if (!validation.isValid) {
    res.status(400);
    res.json(validation.errors);
    return Promise.resolve();
  }

  var data = validation.sanitizedData;
  data.userId = userData.userId;

  return schoolService.create(data).then(function(newSchool) {
    return reminderGen.getRemindersForSchool(
      newSchool[0].id,
      newSchool[0].userId,
      newSchool[0].dueDate
    ).then(function(reminders) {
      return reminderService.bulkCreate(reminders).then(function() {
        res.status(200);
        res.json(newSchool);
      })
    })
  }).catch(function(error) {
    res.status(500);
    res.json(error);
  })
};

module.exports = schoolsController;
