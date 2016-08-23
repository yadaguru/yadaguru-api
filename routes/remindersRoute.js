var express = require('express');
var router = express.Router();
var remindersController = require('../controllers/remindersController');

var routes = function() {

  router.route('/')
    .get(remindersController.getAllForUser);

  router.route('/school/:schoolId')
    .get(remindersController.getAllForSchool);

  router.route('/:id')
    .get(remindersController.getById);

  return router;
};

module.exports = routes();
