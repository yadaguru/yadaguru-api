var express = require('express'),
    account = require('./middleware/account');

var routes = function(User) {
  var router = express.Router();

  router.post('/login', account.authenticate);

  router.post('/logout', function(req, res) {
    req.logout();
    res.sendStatus(200);
  });

  router.get('/currentUser', function(req, res) {
    if (req.user) {
      var user = req.user.toObject();
      delete user.salt;
      delete user.hashedPassword;
      res.send({ success: true, user: user });
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
