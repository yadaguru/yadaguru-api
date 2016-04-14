var express              = require('express');
    massive          = require('massive'),
    connectionString = 'postgres://postgres:postgres@localhost:15432/yadaguru'; // TODO: Move to settings file

var app = express();

// connect to Massive and get DB, loading tables, functions, ect
var massiveInstance = massive.connectSync({ connectionString : connectionString });

// Set a reference to the massive instance on app
app.set('db', massiveInstance);

var router = express.Router();

router.get('/', function(req, res) {

  res.status(200).send('foobar');

});

app.use('/', router);

// Import controllers
var categories = require('./controllers/categories');

// Setup routes
app.use('/api/categories', categories);
app.use('/api/reminders', require('./controllers/remindersController'));
app.use('/api/users', require('./controllers/usersController'));

app.listen(3005, function () {
  console.log('Running on PORT: ' + 3005);
});

module.exports = app;
