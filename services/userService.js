var User = require('../models/').User;
var userService = require('./baseDbService')(User);

userService.getUserByPhoneNumber = function(phoneNumber) {
  return User.findOne({where: {phoneNumber: phoneNumber}}).then(function(user) {
    return user;
  })
};

module.exports = userService;
