var express = require('express');
var router = express.Router();
var contentItemsController = require('../controllers/contentItemsController');

var routes = function() {

  router.route('/')
    .get(contentItemsController.getAll)
    .post(contentItemsController.post);

  router.route('/:id')
    .put(contentItemsController.putOnId)
    .delete(contentItemsController.removeById);

  router.route('/:name')
    .get(contentItemsController.getByName);

  return router;
};

module.exports = routes();
