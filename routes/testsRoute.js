var express = require('express');
var router = express.Router();
var testsService = require('../services/testsService');
var testsController = require('../controllers/testsController')(testsService);

var routes = function() {

  router.route('/')
    .get(testsController.getAll);

  router.route('/:id')
    .get(testsController.getOne);

  router.route('/')
    .post(testsController.post);

  router.route('/:id')
    .put(testsController.put);

  router.route('/:id')
    .delete(testsController.delete);

  return router;

};

module.exports = routes;
