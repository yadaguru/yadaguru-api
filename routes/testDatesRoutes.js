var express = require('express');
var router = express.Router();
var testDatesService = require('../services/testDatesService');
var httpResponseService = require('../services/httpResponseService');
var testDatesController = require('../controllers/testDatesController')(testDatesService, httpResponseService());

var routes = function() {

  router.route('/')
    .get(testDatesController.getAll);

  router.route('/:id')
    .get(testDatesController.getOne);

  router.route('/')
    .post(testDatesController.post);

  router.route('/:id')
    .put(testDatesController.put);

  router.route('/:id')
    .delete(testDatesController.delete);

  return router;

};

module.exports = routes;
