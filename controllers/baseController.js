var validators = require('../services/validatorService');
var errors = require('../services/errorService');
var Promise = require('bluebird');

var resourceControllerFactory = function(name, modelService, schema) {

  /**
   * GET /resources
   */
  var getAll = function(req, res) {
    return modelService.findAll().then(function(resources) {
      res.status(200);
      res.json(resources);
    }).catch(function(error) {
      res.status(500);
      res.json(error);
    })
  };

  /**
   * GET /resources/:id
   * With access token in header
   */
  var getAllForUser = function(req, res) {

    //TODO get user ID from token and add to sanitizedData
    var userId = 1;

    return modelService.findByUser(userId).then(function(resource) {
      res.status(200);
      res.json(resource);
    }).catch(function(error) {
      res.status(500);
      res.json(error);
    })


  };

  /**
   * GET /resources/:id
   */
  var getById = function(req, res) {
    return modelService.findById(req.params.id).then(function(resource) {
      if (resource.length === 0) {
        res.status(404);
        res.json(new errors.ResourceNotFoundError(name, req.params.id));
        return;
      }
      res.status(200);
      res.json(resource);
    }).catch(function(error) {
      res.status(500);
      res.json(error);
    })
  };

  var _create = function(sanitizedData, res) {
    return modelService.create(sanitizedData).then(function(newResource) {
      res.status(200);
      res.json(newResource);
    }).catch(function(error) {
      res.status(500);
      res.json(error);
    });
  };

  var _sendInvalidResponse = function(validation, res) {
    res.status(400);
    res.json(validation.errors);
    return Promise.resolve();
  };

  /**
   * POST /resources
   */
  var post = function(req, res) {
    var validation = validators.sanitizeAndValidate(req.body, schema, true);

    if (!validation.isValid) {
      return _sendInvalidResponse(validation, res);
    }

    return _create(validation.sanitizedData, res);
  };

  /**
   * POST /resources
   * With access token in header
   */
  var postForUser = function(req, res) {
    var validation = validators.sanitizeAndValidate(req.body, schema, true);

    if (!validation.isValid) {
      return _sendInvalidResponse(validation, res);
    }

    //TODO get user ID from token and add to sanitizedData
    validation.sanitizedData.userId = 1;

    return _create(validation.sanitizedData, res);
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

    return modelService.update(id, validation.sanitizedData).then(function(updatedResource) {
      if (!updatedResource) {
        res.status(404);
        res.json(new errors.ResourceNotFoundError(name, id));
        return;
      }
      res.status(200);
      res.json(updatedResource);
    }).catch(function(error) {
      res.status(500);
      res.json(error);
    });
  };

  /**
   * DELETE /resources/:id
   */
  var removeById = function(req, res) {
    var id = req.params.id;

    return modelService.destroy(id).then(function(result) {
      if (!result) {
        res.status(404);
        res.json(new errors.ResourceNotFoundError(name, id));
        return;
      }
      res.status(200);
      res.json([{deletedId: id}]);
    }).catch(function(error) {
      res.status(500);
      res.json(error);
    });
  };

  return {
    getAll: getAll,
    getAllForUser: getAllForUser,
    getById: getById,
    post : post,
    postForUser: postForUser,
    putOnId : putOnId,
    removeById : removeById
  }

};

module.exports = resourceControllerFactory;
