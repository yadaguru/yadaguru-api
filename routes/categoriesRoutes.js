var express = require('express');
var router = express.Router();
var categoriesService = require('../services/categoriesService');
var categoriesController = require('../controllers/categoriesController')(categoriesService);

var routes = function() {

  router.route('/')
    .get(categoriesController.getAll);

  router.route('/:id')
    .get(categoriesController.getOne);

  router.route('/')
    .post(categoriesController.post);

  router.route('/:id')
    .put(categoriesController.put);

  router.route('/:id')
    .delete(categoriesController.delete);

  return router;

};

module.exports = routes;
