var express = require('express');
var router = express.Router();
var testDatesController = require('../controllers/testDatesController');

var routes = function() {

  router.route('/')
    .get(testDatesController.getAll)
    .post(testDatesController.post);

  router.route('/:id')
    .get(testDatesController.getById)
    .put(testDatesController.putOnId)
    .delete(testDatesController.removeById);

  return router;
};

module.exports = routes();
