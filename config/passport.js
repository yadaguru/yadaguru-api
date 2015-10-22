var passport      = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

module.exports = function (User) {

  passport.use(new LocalStrategy(
    function (username, password, done) {
      User.find({ where: { username: username } }).then(function (user) {
        if (!user) {
          return done(null, false, { message: 'Username does not exist' });
        } else if (!user.authenticate(password)) {
          return done(null, false, { message: 'Incorrect password' });
        } else {
          return done(null, user);
        }
      });
    }));

  passport.serializeUser(function (user, done) {
    console.log('id: ' + user.id);
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id).then(function (user) {
      done(null, user);
    });
  });

};
