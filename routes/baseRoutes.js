var express  = require('express'),
    account  = require('./middleware/account');

//TODO: All post/put request send error message if no applicaiton/json

var routes = function(Model) {
  var router = express.Router();

  // GET and POST on [/] can be found in the controller
  router.route('/')
    .get(function(req, res) {
      Model.findAll({ }).then(function(rows) {
        var instances = [];

        // Add a link for GET by id to return JSON
        rows.forEach(function(element) {

          // Get entry as JSON object and add link
          var row = element.toJSON();
          // links{} must be added before links.self can be created
          row.links = {};
          row.links.self = 'http://' +
            req.headers.host + req.originalUrl + "/" + row.id;
          // Add new JSON object to return array
          instances.push(row);
        });
        // Return array in JSON format
        res.json(instances);
      }).catch(function(error) {
        // TODO: Detect if Development, if not send simple error and log
        res.status(500).send(error);
      });
    })
    .post(account.requiresRoleApi('admin'), function(req, res) {
        // Get the post data from the body
      Model.create(req.body)
        .then(function(row) {
          res.status(201).send(row);
        }).catch(function(error) {
          // TODO: Detect if Development, if not send simple error and log
          res.status(500).send(error);
        });
    });

  // Middleware to use for all requests
  // Before reaching the route, find the row by ID and pass it up
  router.use('/:id', function(req, res, next) {
    Model.findById(req.params.id).then(function(row) {
      if(row) {
        req.row = row;
        next();
      } else {
        res.status(404).send('No item with that id found');
      }
    }).catch(function(error) {
      // TODO: Detect if Development, if not send simple error and log
      res.status(500).send(error);
    });
  });

  // GET/PUT/DELETE by id
  router.route('/:id')

    // For get requests just return the data
    .get(function(req, res) {
      res.json(req.row);
    })

    // For update PUT requests process and return new data
    .put(account.requiresRoleApi('admin'), function(req, res) {
      // Save new row object and return
      req.row.update(req.body).then(function() {
        res.json(req.row);
      }).catch(function(error) {
        // TODO: Detect if Development, if not send simple error and log
        res.status(500).send(error);
      });
    })

    // Attempt to remove item from db
    .delete(account.requiresRoleApi('admin'), function(req, res) {
      req.row.destroy().then(function () {
        res.status(204).send('Removed');
      }).catch(function(error) {
        // TODO: Detect if Development, if not send simple error and log
        res.status(500).send(error);
      });
    });

  return router;
};

module.exports = routes;
