var express = require('express');
var router = express.Router();
var httpResponseService = require('../services/httpResponseService');
var baseRemindersService = require('../services/baseRemindersService');
var baseRemindersController = require('../controllers/baseRemindersController')(baseRemindersService, httpResponseService);

var routes = function() {

  router.route('/')
    .get(baseRemindersController.getAll);

  router.route('/:id')
    .get(baseRemindersController.getOne);

  router.route('/')
    .post(baseRemindersController.post);

  router.route('/:id')
    .put(baseRemindersController.put);

  router.route('/:id')
    .delete(baseRemindersController.delete);

  return router;

};

module.exports = routes;
