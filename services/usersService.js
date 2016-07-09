var models = require('../models');
var Promise = require('bluebird');
var errorService = require('./errorService');

var usersService = function() {

  var User = models.User;

  var create = function(values) {
    var phoneNumber = sanitizePhoneNumber(values.phoneNumber);
    if (isPhoneNumber(phoneNumber)) {
      return User.create({phoneNumber: phoneNumber}).then(function(resp) {
        return Promise.resolve(resp.dataValues);
      }, function(error) {
        return Promise.reject(errorService.makeError(error.name));
      });
    }
    return Promise.reject(new errorService.makeError('Invalid Phone Number: Must be 10 digits'));
  };

  var update = function() {

  };

  var sanitizePhoneNumber = function(phoneNumber) {
    return phoneNumber.replace(/\D+/g, "");
  };

  var isPhoneNumber = function(phoneNumber) {
    var phoneNumberRegex = /^\d{10}$/;
    return phoneNumberRegex.test(phoneNumber);
  };

  return {
    create : create,
    update: update
  };
};

module.exports = usersService();
