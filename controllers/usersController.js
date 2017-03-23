var validators = require('../services/validatorService');
var errors = require('../services/errorService');
var moment = require('moment');
var auth = require('../services/authService');
var env = process.env.NODE_ENV;
var config = require('../config/config.json')[env];
var userService = require('yadaguru-data')(config).userService;
var twilioService = require('../services/twilioService');
var logger = require('../services/loggerService');

var schema = {
  phoneNumber: {
    required: true,
    rules: [{
      validator: 'isPhoneNumber',
      message: 'must be a string of 10 digits'
    }],
    sanitizers: ['sanitizeDigitString']
  },
  confirmCode: {
    rules: [{
      validator: 'isSixDigits',
      message: 'must be a string of 6 digits'
    }],
    sanitizers: ['sanitizeDigitString']
  },
  sponsorCode: {
    required: false
  }
};

var usersController = require('./baseController')('User', userService, schema);

module.exports = function() {
  usersController.post = function (req, res) {
    var validation = validators.sanitizeAndValidate(req.body, schema, true);

    if (!validation.isValid) {
      res.status(400);
      res.json(validation.errors);
      return Promise.resolve();
    }

    return userService.getUserByPhoneNumber(validation.sanitizedData.phoneNumber).then(function(user) {
      if (user) {
        return _loginUser(user).then(function(user) {
          return _sendConfirmCode(user.confirmCode, validation.sanitizedData.phoneNumber).then(function() {
            res.status(200);
            if (env === 'development') {
              // send confirm code in response for developer convenience
              res.json({userId: user.id, confirmCode: user.confirmCode});
            } else {
              res.json({userId: user.id})
            }
          });
        });
      }
      return _createUser(validation.sanitizedData).then(function(user) {
        return _sendConfirmCode(user.confirmCode, validation.sanitizedData.phoneNumber).then(function() {
          res.status(200);
          if (env === 'development') {
            // send confirm code in response for developer convenience
            res.json({userId: user.id, confirmCode: user.confirmCode});
          } else {
            res.json({userId: user.id})
          }
        });
      })
    }).catch(function(error) {
      logger.error(error);
      res.status(500);
      res.json(error);
    });
  };

  usersController.putOnId = function(req, res) {
    var id = req.params.id;
    var validation = validators.sanitizeAndValidate(req.body, schema);

    if (!validation.isValid) {
      res.status(400);
      res.json(validation.errors);
      return Promise.resolve();
    }

    // If confirm code is in body, we are logging in an verifying the confirmation code
    if (validation.sanitizedData.confirmCode) {
      return _verifyUser(id, validation.sanitizedData.confirmCode, res);
    }

    // If no confirm code, we are updating user data, verify token and proceed with update
    var userData = auth.getUserData(req.get('Authorization'));
    if (!userData || userData.role !== 'user' || userData.userId != id) {
      res.status(401);
      res.json(new errors.NotAuthorizedError());
      return Promise.resolve();
    }

    return _update(id, validation.sanitizedData, res);
  };

  function _loginUser(user) {
    user.confirmCode = auth.generateConfirmCode();
    user.confirmCodeTimestamp = moment.utc().format();
    return user.save().then(function(user) {
      return user;
    });
  }

  function _createUser(data) {
    data.confirmCode = auth.generateConfirmCode();
    data.confirmCodeTimestamp = moment.utc().format();
    return userService.create(data).then(function(newUser) {
      return newUser[0];
    })
  }

//TODO: Move this to a Twilio service
  function _sendConfirmCode(confirmCode, phoneNumber) {
    var message = 'Yadaguru Confirmation Code: ' + confirmCode;
    return twilioService.sendMessage(phoneNumber, message);
  }

  function _update(id, data, res) {
    return userService.update(id, data).then(function(updatedUser) {
      if (!updatedUser) {
        res.status(404);
        res.json(new errors.ResourceNotFoundError('User', id));
        return;
      }
      updatedUser = updatedUser[0];
      res.status(200);
      res.json([{
        id: updatedUser.id,
        phoneNumber: updatedUser.phoneNumber,
        sponsorCode: updatedUser.sponsorCode,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }]);
    }).catch(function(error) {
      logger.error(error);
      res.status(500);
      res.json(error);
    });
  }

  function _verifyUser(id, confirmCode, res) {
    return userService.findById(id).then(function(user) {
      if (user.length === 0) {
        res.status(404);
        res.json(new errors.ResourceNotFoundError('User', id));
        return;
      }

      user = user[0];
      if (user.confirmCode === confirmCode && _isTimestampValid(user.confirmCodeTimestamp)) {
        var token = auth.getUserToken(user.id, 'user');
        res.status(200);
        res.json({token: token});
        return;
      }

      res.status(400);
      res.json(new errors.LoginError());
    })
  }

  function _isTimestampValid(timestamp) {
    // TODO - make 60000 configurable
    return moment.utc().diff(moment(timestamp)) <= 60000;
  }

  usersController.removeById = function(req, res) {
    var id = req.params.id;
    var userData = auth.getUserData(req.get('Authorization'));
    if (!userData || userData.role !== 'user' || userData.userId != id) {
      res.status(401);
      res.json(new errors.NotAuthorizedError());
      return Promise.resolve();
    }

    return userService.destroy(id).then(function(result) {
      if (!result) {
        res.status(404);
        res.json(new errors.ResourceNotFoundError('User', id));
        return;
      }
      res.status(200);
      res.json([{deletedId: id}]);
    }).catch(function(error) {
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        res.status(409);
        res.json(new errors.ForeignConstraintError('User'));
        return;
      }
      logger.error(error);
      res.status(500);
      res.json(error);
    });
  };

  return usersController;
}();



