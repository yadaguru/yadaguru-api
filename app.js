/* Main Dependencies */
var express = require('express');
var http = require('http');
var https = require('https');
var bodyParser = require('body-parser');
var cors = require('cors');
var morgan = require('morgan');
var env       = process.env.NODE_ENV || 'development';
var config    = require('./config/config.json')[env];
var Sequelize = require('sequelize');
var sequelize;

/* Setup app and configure middleware */
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

/* Setup cross-origin resource sharing */
// TODO make origin configurable depending on environment
app.use(cors({
  origin: ['http://localhost:9000', 'http://localhost:8000']
}));

/* Setup logging */
// TODO make this configurable depending on environment
app.use(morgan('dev'));

/* Setup database connection */
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable]);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}
app.set('db', sequelize);

/* Routes */
var router = express.Router();

router.get('/', function(req, res) {
  res.status(200).send('foobar');
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

/* Setup methods for starting and stopping HTTP(S) servers */
var httpServer, httpsServer;
app.startHttp = function() {
  httpServer = http.createServer(app);
  httpServer.listen(3005);
  console.log("Starting http server on port: " + 3005);
};

app.stopHttp = function() {
  if (httpServer === null) return;
  httpServer.close();
  console.log('Closing http server');
  httpServer = undefined;
};

app.startHttps = function() {
  httpsServer = http.createServer(app);
  httpsServer.listen(443);
  console.log("Starting http server on port: " + 443);
};

app.stopHttps = function() {
  if (httpsServer === null) return;
  httpsServer.stop();
  console.log('Closing https server');
  httpServer = undefined;
};

module.exports = app;
