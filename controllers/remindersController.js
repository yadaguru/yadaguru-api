var remindersController = function(remindersService) {

    var getByUserId = function(req, res) {
        
        // TODO get user id from token 
        var userId = '';

        var reminders = remindersService.findByUserId(userId);

        res.status(200);
        res.send(reminders);
    };

    var getByIdAndUserId = function(req, res) {

    	// TODO get user id from token
    	var userId = '';
        var reminderId = req.params.reminderId;

        // Should return null if the reminder is not assigned to the user
        var reminder = remindersService.findByIdAndUserId(reminderId, userId);

        res.status(200);
        res.send(reminder);
    };

    var getByUserIdAndSchoolId = function(req, res) {

        // TODO get user id from token
    	var userId = '';
        var schoolId = req.params.schoolId;

        var reminders = remindersService.findByUserIdAndSchoolId(userId, schoolId);

        res.status(200);
        res.send(reminders);
    };

    return {
    	getByUserId : getByUserId,
  		getByIdAndUserId : getByIdAndUserId,
      	getByUserIdAndSchoolId : getByUserIdAndSchoolId
    };
};

module.exports = remindersController;