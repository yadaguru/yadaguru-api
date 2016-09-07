var express = require('express');
var router = express.Router();
var adminUsersController = require('../controllers/adminUsersController');

var routes = function() {

  router.route('/')
    .post(adminUsersController.post);

  return router;
};

module.exports = routes();
