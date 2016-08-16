var User = require('../models/').User;
var userService = require('./baseDbService')(User);

module.exports = userService;
