var remindersController = function(remindersService) {

    var post = function(req, res) {
        var phoneNumber = req.body.phoneNumber;

        var userId = remindersService.create(phoneNumber);

        res.status(200);
        res.send({ id: userId });
    };

    return {
      post: post
    };
};

module.exports = remindersController;