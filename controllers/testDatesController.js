var testDatesController = function(testDatesService, httpResponseService) {


  /**
   * Field validation rules.
   *
   * @property {boolean} field.required - Set to true if field is required.
   * @property {string} field.message - Message to return if field is invalid.
   * @property {function} field.validate = Callback run to determine if field is valid. Should return true
   * if field is valid, false if not. Callback is passed the field value, the validator object (see link), and
   * the data of all of the fields.
   *
   * @see https://www.npmjs.com/package/validator
   */
  var _fieldRules = {
    test: {
      required: true,
      message: 'test must be a test ID',
      validate: function(field) {
        return typeof field === 'number'
      }
    },
    registrationDate: {
      required: true,
      message: 'registrationDate must be an ISO8601 formatted date',
      validate: function(field, validator) {
        return validator.isISO8601(field);
      }
    },
    adminDate: {
      required: true,
      message: 'adminDate must be an ISO8601 formatted date',
      validate: function(field, validator) {
        return validator.isISO8601(field);
      }
    }
  };

  var getAll = function(req, res) {

    var testDates = testDatesService.findAll();

    res.status(200);
    res.send(testDates);

  };

  var getOne = function(req, res) {

    var testDate = testDatesService.findOne(req.params.id);

    res.status(200);
    res.send(testDate);

  };


  var post = function(req, res) {

    var errors = httpResponseService.validateRequest(req.body, _fieldRules);

    if (errors.length > 0) {
      var status = 422;
      res.status(status);
      res.send(httpResponseService.assembleErrorResponse(status, errors));
      return;
    }

    var newTestDate = {
      test: req.body.test,
      registrationDate: req.body.registrationDate,
      adminDate: req.body.adminDate
    };

    var testDates = testDatesService.create(newTestDate);

    res.status(200);
    res.send(testDates);

  };

  var put = function(req, res) {

    var errors = httpResponseService.validateRequest(req.body, _fieldRules);

    if (errors.length > 0) {
      var status = 422;
      res.status(status);
      res.send(httpResponseService.assembleErrorResponse(status, errors));
      return;
    }

    var updatedTestDate = {
      test: req.body.test,
      registrationDate: req.body.registrationDate,
      adminDate: req.body.adminDate
    };

    var testDates = testDatesService.update(req.params.id, updatedTestDate);

    res.status(200);
    res.send(testDates);

  };

  var del = function(req, res) {

    var testDates = testDatesService.destroy(req.params.id);

    res.status(200);
    res.send(testDates);

  };

  return {
    getAll: getAll,
    getOne: getOne,
    post: post,
    put: put,
    del: del
  }

};

module.exports = testDatesController;
