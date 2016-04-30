var express = require('express');
var router = express.Router();
var usersService = require('../services/usersService');
var usersController = require('../controllers/usersController')(userService);

var routes = function() {

  router.route('/')
    .post(usersController.post);

  router.route('/:userId')
    .put(usersController.putOnId);

  router.route('/:userId')
    .delete(usersController.removeById);

  return router;
};

module.exports = routes;
