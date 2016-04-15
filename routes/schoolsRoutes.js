var express = require('express');
var router = express.Router();
var schoolsService = require('../services/schoolsService');
var schoolsController = require('../controllers/schoolsController')(schoolsService);

var routes = function() {

    router.route('/')
        .get(schoolsController.get);

    router.route('/')
        .post(schoolsController.post);

    router.route('/:schoolId')
        .get(schoolsController.getById);

    router.route('/:schoolId')
        .put(schoolsController.put);

    return router;
};

module.exports = routes;