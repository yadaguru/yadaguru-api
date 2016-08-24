var express = require('express');
var router = express.Router();
var timeframesController = require('../controllers/timeframesController');

var routes = function() {

  router.route('/')
    .get(timeframesController.getAll)
    .post(timeframesController.post);

  router.route('/:id')
    .get(timeframesController.getById)
    .put(timeframesController.putOnId)
    .delete(timeframesController.removeById);

  return router;
};

module.exports = routes();
