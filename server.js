var config           = require('./config/config.js')(),
    app              = require('./config/express.js')(),
    massive          = require('massive'),
    connectionString = 'postgres://postgres:postgres@localhost:15432/yadaguru'; // TODO: Move to settings file

// connect to Massive and get DB, loading tables, functions, ect
var massiveInstance = massive.connectSync({ connectionString : connectionString });

// Set a reference to the massive instance on app
app.set('db', massiveInstance);

app.listen(config.port, function () {
  console.log('Running on PORT: ' + config.port);
});

module.exports = app;
