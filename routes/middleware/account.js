'use strict';

var passport = require('passport');

exports.authenticate = function(req, res) {
  var auth = passport.authenticate('local', function (err, user, info) {
    if (err) {
      return res.send(err);
    }
    if (!user) {
      return res.send({ success: false, message: info.message });
    }
    user.clean();
    req.login(user, function (err) {
      if (err) {
        res.send(err);
      } else {
        res.send({ success: true, user: user });
      }
    });
  });
  auth(req, res);
};

exports.requiresRoleApi = function(role) {
  return function(req, res, next) {
    if(!req.isAuthenticated() || req.user.roles.indexOf(role) === -1) {
      res.status(403).send('Not authorized');
      res.end();
    } else {
      next();
    }
  };
};

exports.requiresRole = function(role) {
  return function(req, res, next) {
    if(!req.isAuthenticated() || req.user.roles.indexOf(role) === -1) {
      res.redirect('/login');
      res.end();
    } else {
      next();
    }
  };
};
