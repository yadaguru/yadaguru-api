var schoolsController = function(schoolsService) {

	var get = function (req, res) {

		// TODO get user ID from header token
		var userId = '';

		var schools = schoolsService.getByUserId(userId);

		res.status(200);
        res.send(schools);
	};

};

module.exports = schoolsController;