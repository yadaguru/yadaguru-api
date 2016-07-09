var usersController = function() {

  var usersService = require('../services/usersService');
  /*
   * POST /users/
   */
  var post = function(req, res) {

    var phoneNumber = req.body.phoneNumber;
    return usersService.create({phoneNumber: phoneNumber}).then(function(data) {
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
