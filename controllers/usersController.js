var usersController = function(usersService) {

  /*
   * POST /users/
   */
  var post = function(req, res) {

    var phoneNumber = req.body.phoneNumber;

    var userId = usersService.create(phoneNumber);

    res.status(200);
    res.send({id: userId});
  };

  /*
   * PUT /users/:userId
   */
  var put = function(req, res) {

  	var userId = req.params.userId;
    var phoneNumber = req.body.phoneNumber;
    var confirmCode = req.body.confirmCode;
    var personalCode = req.body.personalCode;
    var sponsorCode = req.body.sponsorCode;

    var user = usersService.update(userId, phoneNumber, confirmCode, personalCode, sponsorCode);

    res.status(200);
    res.send({id: user});
  };

  /*
   * DELETE /users/:userId
   */
  var remove = function(req, res) {

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
    put : put,
    remove : remove
  };
};

module.exports = usersController;
