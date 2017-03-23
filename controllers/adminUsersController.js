var env = process.env.NODE_ENV || 'development';
var config = require('../config/config.json')[env];
var adminUserService = require('yadaguru-data')(config).adminUserService;
var validators = require('../services/validatorService');
var errors = require('../services/errorService');
var moment = require('moment');
var auth = require('../services/authService');
var logger = require('../services/loggerService');

var schema = {
  userName: {
    required: true
  },
  password: {
    required: true
  }
};

module.exports = function() {
  var adminUsersController = {};

  adminUsersController.post = function (req, res) {
    var validation = validators.sanitizeAndValidate(req.body, schema, true);

    if (!validation.isValid) {
      res.status(400);
      res.json(validation.errors);
      return Promise.resolve();
    }

    var data = validation.sanitizedData;

    return adminUserService.verifyUser(data.userName, data.password).then(function(user) {
      if (!user) {
        res.status(401);
        res.json(new errors.AdminLoginError());
        return;
      }

      res.status(200);
      res.json({token: auth.getUserToken(user.id, 'admin')});
    }).catch(function(error) {
      logger.error(error);
      res.status(500);
      res.json(error);
    });

  };

  return adminUsersController;
}();



