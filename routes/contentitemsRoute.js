var express = require('express');
var router = express.Router();
var contentItemsController = require('../controllers/contentItemsController');

var routes = function() {

  router.route('/')
    .get(contentItemsController.getAll)
    .post(contentItemsController.post);

  router.route('/:id')
    .get(contentItemsController.getById)
    .put(contentItemsController.putOnId)
    .delete(contentItemsController.removeById);

  return router;
};

module.exports = routes();
