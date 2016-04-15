var express = require('express');
var router = express.Router();
var remindersService = require('../services/remindersService');
var remindersController = require('../controllers/remindersController')(remindersService);

var routes = function() {
  router.route('/')
    .get(remindersController.getByUserId);

  router.route('/:reminderId')
    .get(remindersController.getByIdAndUserId);

  router.route('/schools/:schoolId')
    .get(remindersController.getBySchoolId);

  return router;
};

module.exports = routes;
