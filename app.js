var express = require('express');
var config = require('./config')[process.env.DEPLOY_MODE];
var models = require('./models');
var bodyParser = require('body-parser');

var app = module.exports = express();

if (process.env.DEPLOY_MODE !== 'TEST') {
  models.sequelize.sync(config.dbSyncOptions);
}

var router = express.Router();

router.get('/', function(req, res) {

  res.status(200).send('foobar');

});

app.use(bodyParser.json());

app.use('/', router);

// Setup routes
app.use('/api/categories', require('./controllers/categoriesController'));
app.use('/api/timeframes', require('./controllers/timeframesController'));
app.use('/api/reminders', require('./controllers/remindersController'));
app.use('/api/schools', require('./controllers/schoolsController'));
app.use('/api/base-reminders', require('./controllers/baseRemindersController'));
app.use('/api/tests', require('./controllers/testsController'));
app.use('/api/test-dates', require('./controllers/testDatesController'));

app.use('/api/users', require('./routes/usersRoute'));

app.listen(3005, function () {
  console.log('Running on PORT: ' + 3005);
});
