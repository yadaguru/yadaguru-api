/* Main Dependencies */
var express = require('express');
var http = require('http');
var https = require('https');
var bodyParser = require('body-parser');
var cors = require('cors');
var logger = require('./services/loggerService');
var env = process.env.NODE_ENV || 'development';
var config = require('./config/config.json')[env];
var pjson = require('./package.json');

/* Setup app and configure middleware */
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

/* Setup cross-origin resource sharing */
if (config.cors) {
  app.use(cors({
    origin: config.cors
  }));
}

/* Routes */
var router = express.Router();

/* Log all requests */
app.use(function(req, res, next) {
  logger.debug(req.method, req.originalUrl);
  next();
});

router.get('/healthcheck', function(req, res) {
  res.status(200).json({status: 'OK', version: pjson.version});
});

app.use('/', router);
app.use('/api/users', require('./routes/usersRoute'));
app.use('/api/admin_users', require('./routes/adminUsersRoute'));
app.use('/api/categories', require('./routes/categoriesRoute'));
app.use('/api/content_items', require('./routes/contentItemsRoute'));
app.use('/api/tests', require('./routes/testsRoute'));
app.use('/api/test_dates', require('./routes/testDatesRoute'));
app.use('/api/schools', require('./routes/schoolsRoute'));
app.use('/api/timeframes', require('./routes/timeframesRoute'));
app.use('/api/base_reminders', require('./routes/baseRemindersRoute'));
app.use('/api/reminders', require('./routes/remindersRoute'));

/* catch and log all errors */
app.use(function (err, req, res, next) {
  logger.error(err);
  res.status(500).send('Something broke!')
})

/* Setup methods for starting and stopping HTTP(S) servers */
var httpServer, httpsServer;
app.startHttp = function() {
  httpServer = http.createServer(app);
  httpServer.listen(3005);
  logger.info('Starting http server on port: ' + 3005);
};

app.stopHttp = function() {
  if (httpServer === null) return;
  httpServer.close();
  logger.info('Closing http server');
  httpServer = undefined;
};

app.startHttps = function() {
  httpsServer = http.createServer(app);
  httpsServer.listen(443);
  logger.info("Starting http server on port: " + 443);
};

app.stopHttps = function() {
  if (httpsServer === null) return;
  httpsServer.stop();
  logger.info('Closing https server');
  httpServer = undefined;
};

module.exports = app;
