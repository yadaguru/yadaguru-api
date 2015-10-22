var config     = require('./config/config.js')(),
    app        = require('./config/express.js')(),
    models     = require('./models'),
    requireDir = require('require-dir');

require('./config/passport.js')(models.User);

var routes = requireDir('routes');
for (var route in routes) {
  if (routes.hasOwnProperty(route)) {
    // Remove Routes from name
    // camelCase to dash-format for route names
    var routeName = route.replace('Routes', '')
      .replace(/\W+/g, '-')
      .replace(/([a-z\d])([A-Z])/g, '$1-$2')
      .toLowerCase();
    var router = routes[route](models);
    app.use('/api/' + routeName, router);
    console.log('Registered route ' + routeName);
  }
}

app.listen(config.port, function () {
  console.log('Running on PORT: ' + config.port);
});

module.exports = app;
