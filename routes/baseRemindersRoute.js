var express = require('express');
var router = express.Router();
var baseRemindersController = require('../controllers/baseRemindersController');

var routes = function() {

  router.route('/')
    .get(baseRemindersController.getAll)
    .post(baseRemindersController.post);

  router.route('/:id')
    .get(baseRemindersController.getById)
    .put(baseRemindersController.putOnId)
    .delete(baseRemindersController.removeById);

  return router;
};

module.exports = routes();
