var morgan         = require('morgan'),
    methodOverride = require('method-override'),
    cookieParser   = require('cookie-parser'),
    bodyParser     = require('body-parser'),
    session        = require('express-session'),
    passport       = require('passport'),
    express        = require('express'),
    app            = express();

module.exports = function() {
  var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  };

  app.use(allowCrossDomain);
  app.use(morgan('dev', {
    skip: function() { return process.env.NODE_ENV === 'TEST'; }
  }));
  app.use(bodyParser.urlencoded({'extended':'true'}));
  app.use(bodyParser.json());
  app.use(bodyParser.json({ type: 'application/vnd.api+json '}));
  app.use(methodOverride());
  app.use(cookieParser());
  app.use(session({
    secret: 'Not a good secret',
    resave: true,
    saveUninitialized: false}));
  app.use(passport.initialize());
  app.use(passport.session());

  return app;
};
