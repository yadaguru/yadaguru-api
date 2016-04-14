var express = require('express');
var router = express.Router();
var usersService = require('../services/usersService');
var usersController = require('../controllers/usersController')(userService);

var routes = function() {
    router.route('/')
        .get(usersController.get);

    router.route('/:reminderId')
        .get(usersController.getById);

    router.route('/schools/:schoolId')
        .get(usersController.getBySchoolId);

    return router;
};

module.exports = routes;