var usersController = function(usersService) {

    var post = function(req, res) {
        var phoneNumber = req.body.phoneNumber;

        var userId = usersService.create(phoneNumber);

        res.status(200);
        res.send({ id: userId });
    };

    return {
      post: post
    };
};

module.exports = usersController;