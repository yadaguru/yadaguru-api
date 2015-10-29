var express = require('express'),
    account = require('./middleware/account');

var routes = function(User) {
  var router = express.Router();

  router.get('/', account.requiresRoleApi('admin'), function(req, res) {
    User.findAll({ }).then(function(users) {
      res.send(users);
    });
  });

  router.post('/login', account.authenticate);

  router.post('/logout', function(req, res) {
    req.logout();
    res.sendStatus(200);
  });

  router.get('/current-user', function(req, res) {
    if (req.user) {
      req.user.clean();
      res.send({ success: true, user: req.user });
    } else {
      res.send({ success: false });
    }
  });

  // router.post('/create', function(req, res) {
  //   var salt = User.createSalt();
  //   var hash = User.hashPassword(salt, req.body.password);
  //   User.create({ username: req.body.username, salt: salt, hashed_password: hash, roles: ['admin'] })
  //     .then(function() {
  //       res.sendStatus(200);
  //     });
  // });

  return router;
};

module.exports = routes;
