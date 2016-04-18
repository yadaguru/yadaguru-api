var express = require('express');
var router = express.Router();
var contentItemsService = require('../services/contentItemsService');
var httpResponseService = require('../services/httpResponseService');
var contentItemsController = require('../controllers/contentItemsController')(contentItemsService, httpResponseService());

var routes = function() {

  router.route('/')
    .get(contentItemsController.getAll);

  router.route('/:id')
    .get(contentItemsController.getOne);

  router.route('/')
    .post(contentItemsController.post);

  router.route('/:id')
    .put(contentItemsController.put);

  router.route('/:id')
    .delete(contentItemsController.delete);

  return router;

};

module.exports = routes;
