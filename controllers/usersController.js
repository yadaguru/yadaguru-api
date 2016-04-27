var usersController = function(usersService) {

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

  return {
    post: post
  };
};

module.exports = usersController;
