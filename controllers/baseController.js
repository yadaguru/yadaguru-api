var validators = require('../services/validatorService');
var errors = require('../services/errorService');
var Promise = require('bluebird');
var auth = require('../services/authService');
var logger = require('../services/loggerService');

var resourceControllerFactory = function(name, modelService, schema, requiredRoles) {

  schema = schema || {};
  requiredRoles = requiredRoles || {};

  function isUserAuthorized(req, method, roles) {
    if (!roles[method]) {
      return true;
    }

    var userData = auth.getUserData(req.get('Authorization'));
    return userData && roles[method].indexOf(userData.role) > -1;
  }

  function getAuthorizedUser(req, method, roles) {
    if (!roles[method]) {
      throw new Error('This route requires user data and must be restricted to at least one role.');
    }

    var userData = auth.getUserData(req.get('Authorization'));
    if (!userData || roles[method].indexOf(userData.role) < 0) {
      return false;
    }

    return userData;
  }

  /**
   * GET /resources
   */
  var getAll = function(req, res) {
    if (!isUserAuthorized(req, 'getAll', requiredRoles)) {
      res.status(401);
      res.json(new errors.NotAuthorizedError());
      return Promise.resolve();
    }

    return modelService.findAll().then(function(resources) {
      res.status(200);
      res.json(resources);
    }).catch(function(error) {
      logger.error(error);
      res.status(500);
      res.json(error);
    });

  };

  /**
   * GET /resources/:id
   * With access token in header
   */
  var getAllForUser = function(req, res) {
    var userData = getAuthorizedUser(req, 'getAllForUser', requiredRoles);
    if (!userData) {
      res.status(401);
      res.json(new errors.NotAuthorizedError());
      return Promise.resolve();
    }

    var userId = userData.userId;

    return modelService.findByUser(userId).then(function(resource) {
      res.status(200);
      res.json(resource);
    }).catch(function(error) {
      logger.error(error);
      res.status(500);
      res.json(error);
    })

  };

  var getAllForResource = function(resource, modelMethod) {
    return function(req, res) {
      if (!isUserAuthorized(req, 'getAllFor' + resource, requiredRoles)) {
        res.status(401);
        res.json(new errors.NotAuthorizedError());
        return Promise.resolve();
      }

      var resourceId = req.params[resource];

      return modelService[modelMethod](resourceId).then(function(resource) {
        res.status(200);
        res.json(resource);
      }).catch(function(error) {
        logger.error(error);
        res.status(500);
        res.json(error);
      })
    }
  };

  var getAllForResourceForUser = function(resource) {
    return function(req, res) {
      var userData = getAuthorizedUser(req, 'getAllFor' + resource + 'ForUser', requiredRoles);
      if (!userData) {
        res.status(401);
        res.json(new errors.NotAuthorizedError());
        return Promise.resolve();
      }

      var id = req.params.id;
      var userId = userData.userId;

      return modelService.findByResourceForUser(resource, id, userId).then(function(resource) {
        res.status(200);
        res.json(resource);
      }).catch(function(error) {
        logger.error(error);
        res.status(500);
        res.json(error);
      })
    }
  };

  /**
   * GET /resources/:id
   */
  var getById = function(req, res) {
    if (!isUserAuthorized(req, 'getById', requiredRoles)) {
      res.status(401);
      res.json(new errors.NotAuthorizedError());
      return Promise.resolve();
    }

    return modelService.findById(req.params.id).then(function(resource) {
      if (resource.length === 0) {
        res.status(404);
        res.json(new errors.ResourceNotFoundError(name, req.params.id));
        return;
      }
      res.status(200);
      res.json(resource);
    }).catch(function(error) {
      logger.error(error);
      res.status(500);
      res.json(error);
    })
  };

  /**
   * GET /resources/:name
   */
  var getByName = function(req, res) {
    if (!isUserAuthorized(req, 'getByName', requiredRoles)) {
      res.status(401);
      res.json(new errors.NotAuthorizedError());
      return Promise.resolve();
    }

    return modelService.findByName(req.params.name).then(function(resource) {
      if (resource.length === 0) {
        res.status(404);
        res.json(new errors.ResourceNotFoundError(name, req.params.name));
        return;
      }
      res.status(200);
      res.json(resource);
    }).catch(function(error) {
      logger.error(error);
      res.status(500);
      res.json(error);
    })
  };

  var getByIdForUser = function(req, res) {
    var userData = getAuthorizedUser(req, 'getByIdForUser', requiredRoles);
    if (!userData) {
      res.status(401);
      res.json(new errors.NotAuthorizedError());
      return Promise.resolve();
    }

    return modelService.findByIdForUser(req.params.id, userData.userId).then(function(resource) {
      if (resource.length === 0) {
        res.status(404);
        res.json(new errors.ResourceNotFoundError(name, req.params.id));
        return;
      }
      res.status(200);
      res.json(resource);
    }).catch(function(error) {
      logger.error(error);
      res.status(500);
      res.json(error);
    })
  };

  var _create = function(sanitizedData, res) {
    return modelService.create(sanitizedData).then(function(newResource) {
      res.status(200);
      res.json(newResource);
    }).catch(function(error) {
      logger.error(error);
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
    if (!isUserAuthorized(req, 'post', requiredRoles)) {
      res.status(401);
      res.json(new errors.NotAuthorizedError());
      return Promise.resolve();
    }

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
    var userData = getAuthorizedUser(req, 'postForUser', requiredRoles);
    if (!userData) {
      res.status(401);
      res.json(new errors.NotAuthorizedError());
      return Promise.resolve();
    }

    var validation = validators.sanitizeAndValidate(req.body, schema, true);

    if (!validation.isValid) {
      return _sendInvalidResponse(validation, res);
    }

    validation.sanitizedData.userId = userData.userId;

    return _create(validation.sanitizedData, res);
  };

  /**
   * PUT /resources/:id
   */
  var putOnId = function(req, res) {
    if (!isUserAuthorized(req, 'putOnId', requiredRoles)) {
      res.status(401);
      res.json(new errors.NotAuthorizedError());
      return Promise.resolve();
    }

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
      logger.error(error);
      res.status(500);
      res.json(error);
    });
  };

  var putOnIdForUser = function(req, res) {
    var userData = getAuthorizedUser(req, 'postForUser', requiredRoles);
    if (!userData) {
      res.status(401);
      res.json(new errors.NotAuthorizedError());
      return Promise.resolve();
    }

    var id = req.params.id;
    var validation = validators.sanitizeAndValidate(req.body, schema);

    if (!validation.isValid) {
      res.status(400);
      res.json(validation.errors);
      return Promise.resolve();
    }

    return modelService.updateForUser(id, validation.sanitizedData, userData.userId).then(function(updatedResource) {
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
    if (!isUserAuthorized(req, 'removeById', requiredRoles)) {
      res.status(401);
      res.json(new errors.NotAuthorizedError());
      return Promise.resolve();
    }

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
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        res.status(409);
        res.json(new errors.ForeignConstraintError(name));
        return;
      }
      logger.error(error);
      res.status(500);
      res.json(error);
    });
  };

  var removeByIdForUser = function(req, res) {
    var userData = getAuthorizedUser(req, 'removeByIdForUser', requiredRoles);
    if (!userData) {
      res.status(401);
      res.json(new errors.NotAuthorizedError());
      return Promise.resolve();
    }

    var id = req.params.id;

    return modelService.destroyForUser(id, userData.userId).then(function(result) {
      if (!result) {
        res.status(404);
        res.json(new errors.ResourceNotFoundError(name, id));
        return;
      }
      res.status(200);
      res.json([{deletedId: id}]);
    }).catch(function(error) {
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        res.status(409);
        res.json(new errors.ForeignConstraintError(name));
        return;
      }
      logger.error(error);
      res.status(500);
      res.json(error);
    });
  };

  return {
    getAll: getAll,
    getAllForUser: getAllForUser,
    getById: getById,
    getByName: getByName,
    getByIdForUser: getByIdForUser,
    getAllForResource: getAllForResource,
    getAllForResourceForUser: getAllForResourceForUser,
    post : post,
    postForUser: postForUser,
    putOnId : putOnId,
    putOnIdForUser : putOnIdForUser,
    removeById : removeById,
    removeByIdForUser: removeByIdForUser
  }

};

module.exports = resourceControllerFactory;
