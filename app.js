/* Main Dependencies */
var express = require('express');
var http = require('http');
var https = require('https');
var bodyParser = require('body-parser');
var env       = process.env.NODE_ENV || 'development';
var config    = require('./config/config.json')[env];
var Sequelize = require('sequelize');
var sequelize;

/* Setup app and configure middleware */
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

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
app.use('/api/categories', require('./routes/categoriesRoute'));

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
