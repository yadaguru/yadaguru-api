var usersController = function() {

  var usersService = require('../services/usersService');
  /*
   * POST /users/
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

  /*
   * PUT /users/:userId
   */
  var putOnId = function(req, res) {

  };

  /*
   * DELETE /users/:userId
   */
  var removeById = function(req, res) {

  };

  return {
    post : post,
    putOnId : putOnId,
    removeById : removeById
  };
};

module.exports = usersController();
