var models = require('../models');
var Promise = require('bluebird');
var makeError = require('./errorService').makeError;
var hasMissingFields = require('./validationService').hasMissingFields;

var usersService = function() {

  var User = models.User;
  var requiredFields = ['phoneNumber'];

  var create = function(values) {

    if (!values) {
      return Promise.reject(makeError('No data supplied', 400));
    }
    var missingFields;
    if (missingFields = hasMissingFields(values, requiredFields)) {
      return Promise.reject(makeError('Missing Fields:', 400, missingFields));
    }

    var phoneNumber = sanitizePhoneNumber(values.phoneNumber);
    if (isPhoneNumber(phoneNumber)) {
      return User.create({phoneNumber: phoneNumber}).then(function(resp) {
        return Promise.resolve(resp.dataValues);
      }, function(error) {
        return Promise.reject(makeError(error.name));
      });
    }
    return Promise.reject(new makeError('Invalid Phone Number: Must be 10 digits'));
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
