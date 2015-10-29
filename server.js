var config     = require('./config/config.js')(),
    app        = require('./config/express.js')(),
    models     = require('./models');

// Should be refactored, using models.users isn't obvious without looking at models/index.js
require('./config/passport.js')(models.users);

for (var model in models) {
  if (models.hasOwnProperty(model)) {
    // Skip sequelize exports
    if (model.toLowerCase() === 'sequelize' ) {
      continue;
    }
    // Get router for model
    var router = null;
    // Get path of model route
    var path = './routes/' + model + 'Routes.js';
    try {
      // Check for a model specific route
      router = require(path)(models[model]); // Throws error if file not found
    } catch (e) {
      // If no route for model, use base route
      router = require('./routes/baseRoutes.js')(models[model]);
    }
    // Convert camelCase to dash-case for url
    var routeName = model.replace(/\W+/g, '-')
      .replace(/([a-z\d])([A-Z])/g, '$1-$2')
      .toLowerCase();
    // Register route and report to console
    app.use('/api/' + routeName, router);
    console.log('Registered route ' + routeName);
  }
}

app.listen(config.port, function () {
  console.log('Running on PORT: ' + config.port);
});

module.exports = app;
