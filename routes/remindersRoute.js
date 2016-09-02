var express = require('express');
var router = express.Router();
var remindersController = require('../controllers/remindersController');

var routes = function() {

  router.route('/')
    .get(remindersController.getAllForUser);

  router.route('/school/:id')
    .get(remindersController.getAllForSchoolForUser);

  router.route('/:id')
    .get(remindersController.getByIdForUser);

  return router;
};

module.exports = routes();
