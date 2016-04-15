var schoolsController = function(schoolsService) {

	/**
	 *	GET /api/schools/
	 */
	var get = function (req, res) {

		// TODO get user ID from header token
		var userId = '';

		var schools = schoolsService.getByUserId(userId);

		res.status(200);
        res.send(schools);
	};

	/**
	 *	GET /api/schools/{school_id}
	 */
	var getById = function (req, res) {

		// TODO get user ID from header token
		var userId = '';

		var schoolId = req.params.schoolId;

		var school = schoolsService.getByIdAndUserId(schoolId, userId);

		res.status(200);
        res.send(school);
	};

	/**
	 *	POST /api/schools/
	 */
	var post = function (req, res) {

		// TODO get user ID from header token
		var userId = '';

		var tempSchool = {
			userId : userId,
			name : req.body.name,
			dueDate : req.body.dueDate,
			isActive : req.body.isActive
		};

		var schools = schoolsService.create(tempSchool);

		res.status(200);
        res.send(schools);
	};

	/**
	 *	PUT /api/schools/{school_id}
	 */
	var put = function (req, res) {

		// TODO get user ID from header token
		var userId = '';

		var schoolId = req.params.schoolId;

		var tempSchool = schoolsService.getByIdAndUserId(schoolId, userId);

		tempSchool.name = req.body.name;
		tempSchool.dueDate = req.body.dueDate;
		tempSchool.isActive = req.body.isActive;

		var schools = schoolsService.update(tempSchool);

		res.status(200);
        res.send(schools);
	};

	var delete = function (req, res) {

		// TODO get user ID from header token
		var userId = '';

		var schoolId = req.params.schoolId;

		var isReal = schoolsService.exists(schoolId, userId);

		if (isReal) {

			schoolsService.delete(schoolId);
			res.status(200);

		} else {

			// the school does not exist, or is not assigned to this user
			res.status(404);
			res.send('School ID not found');
		}
	};
};

module.exports = schoolsController;