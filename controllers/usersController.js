var usersController = function() {

  var usersService = require('../services/usersService');

  /**
   * GET /users/
   */
  var getAll = function(req, res) {
    return usersService.findAll().then(function(data) {
      res.status(200);
      res.send(data);
    }).catch(function(ApiError) {
      res.status(ApiError.status);
      res.send(ApiError.message);
    })
  }

  /**
   * GET /users/:id
   */
  var getById = function(req, res) {
    return usersService.findById(req.params.id).then(function(data) {
      res.status(200);
      res.send(data);
    }).catch(function(ApiError) {
      res.status(ApiError.status);
      res.send(ApiError.message);
    })
  };

  /**
   * POST /users
   */
  var post = function(req, res) {
    return usersService.create(req.body).then(function(data) {
      res.status(200);
      res.send(data);
    }).catch(function(ApiError) {
      res.status(ApiError.status);
      res.send(ApiError.message);
    });
  };

  /**
   * PUT /users/id
   */
  var putOnId = function(req, res) {
    return usersService.update(req.params.id, req.body).then(function(data) {
      res.status(200);
      res.send(data);
    }).catch(function(ApiError) {
      res.status(ApiError.status);
      res.send(ApiError.message);
    });
  };

  /**
   * DELETE /users/:id
   */
  var removeById = function(req, res) {
    return usersService.destroy(req.params.id).then(function(data) {
      res.status(200);
      res.send(data);
    }).catch(function(ApiError) {
      res.status(ApiError.status);
      res.send(ApiError.message);
    })
  };

  return {
    getAll: getAll,
    getById: getById,
    post : post,
    putOnId : putOnId,
    removeById : removeById
  };
};

module.exports = usersController();
