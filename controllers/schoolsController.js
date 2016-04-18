var schoolsController = function(schoolsService, httpResponseService) {

  var _fieldRules = {
    name: {
      required: true
    },
    dueDate: {
      required: true,
      message: 'dueDate must be an ISO8601 formmated date',
      validate: function(value, validator) {
        return validator.isISO8601(value);
      }
    },
    isActive: {
      required: true,
      message: 'isActive must be boolean',
      validate: function(value) {
        return typeof value === 'boolean';
      }
    }
  };

  /**
   *  GET /api/schools/
   */
  var get = function(req, res) {

    // TODO get user ID from header token
    var userId = '';

    var schools = schoolsService.findByUserId(userId);

    res.status(200);
    res.send(schools);
  };

  /**
   *  GET /api/schools/{school_id}
   */
  var getById = function(req, res) {

    // TODO get user ID from header token
    var userId = '';

    var schoolId = req.params.schoolId;

    var school = schoolsService.findByIdAndUserId(schoolId, userId);

    if (school) {
      res.status(200);
      res.send(school);
    } else {
      res.status(404);
      res.send('School ID not found');
    }
  };

  /**
   *  POST /api/schools/
   */
  var post = function(req, res) {

    var errors = httpResponseService.validateRequest(req.body, _fieldRules);

    if (errors.length > 0) {
      var status = 422;
      res.status(status);
      res.send(httpResponseService.assembleErrorResponse(status, errors));
      return;
    }

    // TODO get user ID from header token
    var userId = '';

    var tempSchool = {
      userId: userId,
      name: req.body.name,
      dueDate: req.body.dueDate,
      isActive: req.body.isActive
    };

    var schools = schoolsService.create(tempSchool);

    res.status(200);
    res.send(schools);
  };

  /**
   *  PUT /api/schools/
   */
  var put = function(req, res) {

    // TODO get user ID from header token
    var userId = '';

    var schools = req.body.schools;

    var tempSchool = {};
    var tempSchools = [];

    // Update each school in request list
    for (var i = 0; i < schools.length; i++) {

      var errors = httpResponseService.validateRequest(schools[i], _fieldRules);

      if (errors.length > 0) {
        var status = 422;
        res.status(status);
        res.send(httpResponseService.assembleErrorResponse(status, errors));
        return;
      }

      tempSchool = schoolsService.findByIdAndUserId(schools[i].schoolId, userId);

      // Make sure this school exists
      if (tempSchool) {

        tempSchool.name = schools[i].name;
        tempSchool.dueDate = schools[i].dueDate;
        tempSchool.isActive = schools[i].isActive;
        tempSchools.push(schoolsService.update(tempSchool));

      } else {

        // the school does not exist, or is not assigned to this user
        res.status(404);
        res.send('School with ID' + schools[i].schoolId + ' not found for this user.');
        break;
      }
    }


    res.status(200);
    res.send(tempSchools);

  };

  /**
   *  PUT /api/schools/{school_id}
   */
  var putOnId = function(req, res) {

    var errors = httpResponseService.validateRequest(req.body, _fieldRules);

    if (errors.length > 0) {
      var status = 422;
      res.status(status);
      res.send(httpResponseService.assembleErrorResponse(status, errors));
      return;
    }

    // TODO get user ID from header token
    var userId = '';

    var schoolId = req.params.schoolId;

    var tempSchool = schoolsService.findByIdAndUserId(schoolId, userId);

    // Make sure this school exists
    if (tempSchool) {

      tempSchool.name = req.body.name;
      tempSchool.dueDate = req.body.dueDate;
      tempSchool.isActive = req.body.isActive;

      var schools = schoolsService.update(tempSchool);

      res.status(200);
      res.send(schools);

    } else {

      // the school does not exist, or is not assigned to this user
      res.status(404);
      res.send('School ID not found');
    }

  };

  /**
   *  DELETE /api/schools/{school_id}
   */
  var remove = function(req, res) {

    // TODO get user ID from header token
    var userId = '';

    var schoolId = req.params.schoolId;

    var isReal = schoolsService.exists(schoolId, userId);

    if (isReal) {

      schoolsService.remove(schoolId);
      res.status(200);

    } else {

      // the school does not exist, or is not assigned to this user
      res.status(404);
      res.send('School ID not found');
    }
  };

  return {
    get: get,
    getById: getById,
    post: post,
    put: put,
    putOnId: putOnId,
    remove: remove
  };
};

module.exports = schoolsController;
