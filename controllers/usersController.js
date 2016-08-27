var userService = require('../services/userService');
var validators = require('../services/validatorService');
var moment = require('moment');
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

  usersController.generateConfirmCode = function() {
    return String(Math.floor(Math.random() * (999999 - 100000) + 100000));
  };

  function _loginUser(user) {
    user.confirmCode = usersController.generateConfirmCode();
    user.confirmCodeTimestamp = moment.utc().format();
    return user.save().then(function(user) {
      return user;
    });
  }

  function _createUser(data) {
    data.confirmCode = usersController.generateConfirmCode();
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

  return usersController;
}();



