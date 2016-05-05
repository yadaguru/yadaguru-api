var usersService = require('../services/usersService');

var usersController = function() {

  /*
   * POST /users/
   */
  var post = function(req, res) {

    var phoneNumber = req.body.phoneNumber;
    usersService.create(phoneNumber, function(error, data) {
      if (error) {
        res.status(error.status);
        res.send({error: error.message});
      } else {
        res.status(200);
        res.send({id: data.userId});
      }
    });
  };

  /*
   * PUT /users/:userId
   */
  var putOnId = function(req, res) {

    var userId = req.params.userId;
    var phoneNumber = req.body.phoneNumber;
    var confirmCode = req.body.confirmCode;
    var personalCode = req.body.personalCode;
    var sponsorCode = req.body.sponsorCode;

    var user = usersService.update(userId, phoneNumber, confirmCode, personalCode, sponsorCode, function (error, data) {
      if (error) {
        res.status(error.status);
        res.send({error: error.message});
      } else {
        // What should be returned on a put?
        res.status(200);
        res.send({id: data.userId});
      }
    });
  };

  /*
   * DELETE /users/:userId
   */
  var removeById = function(req, res) {

  	var userId = req.params.userId;

  	if (usersService.exists(userId)) {
      usersService.remove(userId);
      res.status(200);
      res.send({id: user});
  	} else {
      res.status(404);
      res.send(httpResponseService.assemble404Response('user', userId));
  	}

  };

  return {
    post : post,
    putOnId : putOnId,
    removeById : removeById
  };
};

module.exports = usersController();
