var AdminUser = require('../models/').AdminUser;
var bcrypt = require('bcryptjs');
var adminUserService = {};

adminUserService.create = function(username, password) {
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(password, salt);
  var data = {
    userName: username,
    password: hash
  };

  return AdminUser.create(data).then(function(newUser) {
    return newUser.dataValues;
  })
};

adminUserService.verifyUser = function(username, password) {
  return AdminUser.findOne({where: {userName: username}}).then(function(user) {
    if (!user) {
      return false;
    }

    if (bcrypt.compareSync(password, user.dataValues.password)) {
      return {
        id: user.dataValues.id
      };
    }
    return false;
  });
};

module.exports = adminUserService;
