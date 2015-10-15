var config     = require('./config/config.js')(),
    app        = require('./config/express.js')(config.clientPath),
    requireDir = require('require-dir');

require('./config/passport.js')();

// require('./config/expressRoutes.js')(app);
requireDir('models');

var routes = requireDir('routes');
for (var route in routes) {
  if (routes.hasOwnProperty(route)) {
    // Remove 'Routes' from file name
    // camelCase to dash-format for route names
    var routeName = route.replace('Routes', '')
      .replace(/\W+/g, '-')
      .replace(/([a-z\d])([A-Z])/g, '$1-$2')
      .toLowerCase();
    var router = routes[route];
    app.use('/api/' + routeName, router());
    console.log('Registered route ' + routeName);
  }
}

app.get('/login', function(req, res) {
  res.sendFile(config.clientPath + '/login/index.html');
});

app.get('/admin', function(req, res) {
  res.sendFile(config.clientPath + '/admin/index.html');
});

app.listen(config.port, function () {
  console.log('Running on PORT: ' + config.port);
});

module.exports = app;
