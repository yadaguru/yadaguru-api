var express = require('express');
var router = express.Router();
var categoriesController = require('../controllers/categoriesController');

var routes = function() {

  router.route('/')
    .get(categoriesController.getAll)
    .post(categoriesController.post);

  router.route('/:id')
    .get(categoriesController.getById)
    .put(categoriesController.putOnId)
    .delete(categoriesController.removeById);

  return router;
};

module.exports = routes();
