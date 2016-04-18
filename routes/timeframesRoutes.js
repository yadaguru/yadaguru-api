var express = require('express');
var router = express.Router();
var timeframesService = require('../services/timeframesService');
var httpResponseService = require('../services/httpResponseService');
var timeframesController = require('../controllers/timeframesController')(timeframesService, httpResponseService());

var routes = function() {

  router.route('/')
    .get(timeframesController.getAll);

  router.route('/:id')
    .get(timeframesController.getOne);

  router.route('/')
    .post(timeframesController.post);

  router.route('/:id')
    .put(timeframesController.put);

  router.route('/:id')
    .delete(timeframesController.delete);

  return router;

};

module.exports = routes;
