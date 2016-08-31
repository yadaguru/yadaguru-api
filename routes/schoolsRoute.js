var express = require('express');
var router = express.Router();
var schoolsController = require('../controllers/schoolsController');

var routes = function() {

  router.route('/')
    .get(schoolsController.getAllForUser)
    .post(schoolsController.postForUser);

  router.route('/:id')
    .get(schoolsController.getByIdForUser)
    .put(schoolsController.putOnIdForUser)
    .delete(schoolsController.removeByIdForUser);

  return router;
};

module.exports = routes();
