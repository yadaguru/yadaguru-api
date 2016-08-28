var userService = require('../services/userService');
var validators = require('../services/validatorService');
var errors = require('../services/errorService');
var moment = require('moment');
var auth = require('../services/authService');
var env = process.env.NODE_ENV;

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
          _sendConfirmCode(user.confirmCode);
          res.status(200);
          res.json({userId: user.id})
        });
      }
      return _createUser(validation.sanitizedData).then(function(user) {
        _sendConfirmCode(user.confirmCode);
        res.status(200);
        res.json({userId: user.id});
      })
    }).catch(function(error) {
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

    if (validation.sanitizedData.confirmCode) {
      return _verifyUser(id, validation.sanitizedData.confirmCode, res);
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
    if (env !== 'production') {
      console.log('### CONFIRM CODE TEXT SIMULATION:', confirmCode, '###');
    } else {
      // Send message through Twilio
    }
  }

  function _update(id, data, res) {
    return userService.update(id, data).then(function(updatedUser) {
      if (!updatedUser) {
        res.status(404);
        res.json(new errors.ResourceNotFoundError('User', id));
        return;
      }
      res.status(200);
      res.json(updatedUser);
    }).catch(function(error) {
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

  return usersController;
}();



