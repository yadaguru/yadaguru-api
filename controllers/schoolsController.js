var schoolsController = function(schoolsService, httpResponseService) {

  var _fieldRules = {
    name: {
      required: true
    },
    dueDate: {
      required: true,
      message: 'dueDate must be an ISO8601 formatted date',
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
    var userId = 1;

    var schools = schoolsService.findByUserId(userId);

    res.status(200);
    res.send(schools);
  };

  /**
   *  GET /api/schools/{school_id}
   */
  var getById = function(req, res) {

    // TODO get user ID from header token
    var userId = 1;
    var schoolId = req.params.schoolId;

    var school = schoolsService.findByIdAndUserId(schoolId, userId);

    if (school) {
      res.status(200);
      res.send(school);
    } else {
      res.status(404);
      res.send(httpResponseService.assemble404Response('school', schoolId));
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

    var newSchool = {
      userId: userId,
      name: req.body.name,
      dueDate: req.body.dueDate,
      isActive: req.body.isActive
    };

    var schools = schoolsService.create(newSchool);

    res.status(200);
    res.send(schools);
  };

  /**
   *  PUT /api/schools/
   */
  var put = function(req, res) {

    var status;

    if (Object.keys(req.body).length === 0) {
      status = 422;
      res.status(status);
      res.send(httpResponseService.assembleErrorResponse(status, ['at least one valid field is required']))
      return;
    }

    var errors = httpResponseService.validateRequest(req.body, _fieldRules, true);

    if (errors.length > 0) {
      status = 422;
      res.status(status);
      res.send(httpResponseService.assembleErrorResponse(status, errors));
      return;
    }

    // TODO get user ID from header token
    var userId = 1;

    var updatedSchools;
    var userSchools = schoolsService.findByUserId(userId);

    if (userSchools.length > 0) {
      for (var i = 0; i < userSchools.length; i++) {
        updatedSchools = schoolsService.update(userSchools[i].id, userId, req.body);
      }
      res.status(200);
      res.send(updatedSchools);
    } else {
      res.status(404);
      res.send(httpResponseService.assemble404Response('schools for user', userId, true));
    }

  };

  /**
   *  PUT /api/schools/{school_id}
   */
  var putOnId = function(req, res) {

    var status;

    if (Object.keys(req.body).length === 0) {
      status = 422;
      res.status(status);
      res.send(httpResponseService.assembleErrorResponse(status, ['at least one valid field is required']))
      return;
    }

    var errors = httpResponseService.validateRequest(req.body, _fieldRules, true);

    if (errors.length > 0) {
      status = 422;
      res.status(status);
      res.send(httpResponseService.assembleErrorResponse(status, errors));
      return;
    }

    // TODO get user ID from header token
    var userId = 1;
    var schoolId = req.params.schoolId;

    if (schoolsService.exists(schoolId, userId)) {
      var schools = schoolsService.update(schoolId, userId, req.body);
      res.status(200);
      res.send(schools);
    } else {
      res.status(404);
      res.send(httpResponseService.assemble404Response('school', schoolId));
    }


  };

  /**
   *  DELETE /api/schools/{school_id}
   */
  var remove = function(req, res) {

    // TODO get user ID from header token
    var userId = 1;
    var schoolId = req.params.schoolId;

    if (schoolsService.exists(schoolId, userId)) {
      var schools = schoolsService.remove(schoolId, userId);
      res.status(200);
      res.send(schools);
    } else {
      res.status(404);
      res.send(httpResponseService.assemble404Response('school', schoolId));
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
