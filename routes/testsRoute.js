var express = require('express');
var router = express.Router();
var testsController = require('../controllers/testsController');

var routes = function() {

  router.route('/')
    .get(testsController.getAll)
    .post(testsController.post);

  router.route('/:id')
    .get(testsController.getById)
    .put(testsController.putOnId)
    .delete(testsController.removeById);

  return router;
};

module.exports = routes();
