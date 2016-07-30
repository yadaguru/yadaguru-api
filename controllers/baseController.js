var models = require('../models');
var validators = require('../services/validatorService');
var errors = require('../services/errorService');
var Promise = require('bluebird');

var resourceControllerFactory = function(model, schema) {

  var Resource = models[model];

  /**
   * GET /resources
   */
  var getAll = function(req, res) {
    return Resource.findAll().then(function(resources) {
      res.status(200);
      res.json(resources.map(function(resource) {
        return resource.dataValues;
      }));
    }).catch(function(error) {
      res.status(500);
      res.json(error);
    })
  };

  /**
   * GET /resources/:id
   */
  var getById = function(req, res) {
    return Resource.findById(req.params.id).then(function(resource) {
      if (!resource) {
        res.status(404);
        res.json(new errors.ResourceNotFoundError(model, req.params.id));
        return;
      }
      res.status(200);
      res.json([resource.dataValues]);
    }).catch(function(error) {
      res.status(500);
      res.json(error);
    })
  };

  /**
   * POST /resources
   */
  var post = function(req, res) {
    var validation = validators.sanitizeAndValidate(req.body, schema, true);

    if (!validation.isValid) {
      res.status(400);
      res.json(validation.errors);
      return Promise.resolve();
    }

    return Resource.create(validation.sanitizedData).then(function(resp) {
      res.status(200);
      res.json([resp.dataValues]);
    }).catch(function(error) {
      res.status(500);
      res.json(error);
    });
  };

  /**
   * PUT /resources/:id
   */
  var putOnId = function(req, res) {
    var id = req.params.id;
    var validation = validators.sanitizeAndValidate(req.body, schema);

    if (!validation.isValid) {
      res.status(400);
      res.json(validation.errors);
      return Promise.resolve();
    }

    return Resource.findById(id).then(function(resource) {
      if (!resource) {
        res.status(404);
        res.json(new errors.ResourceNotFoundError(model, id));
        return Promise.resolve();
      }
      return resource.update(validation.sanitizedData).then(function(resp) {
        res.status(200);
        res.json([resp.dataValues]);
      }).catch(function(error) {
        res.status(500);
        res.json(error);
      });
    })
  };

  /**
   * DELETE /resources/:id
   */
  var removeById = function(req, res) {
    var id = req.params.id;

    return Resource.findById(id).then(function(resource) {
      if (!resource) {
        res.status(404);
        res.json(new errors.ResourceNotFoundError(model, id));
        return Promise.resolve();
      }
      return resource.destroy().then(function() {
        res.status(200);
        res.json([{
          deletedId: id
        }])
      }).catch(function(error) {
        res.status(500);
        res.json(error);
      })
    });
  };

  return {
    getAll: getAll,
    getById: getById,
    post : post,
    putOnId : putOnId,
    removeById : removeById
  }

};

module.exports = resourceControllerFactory;
