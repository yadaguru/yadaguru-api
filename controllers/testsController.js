var testsController = function(testsService, httpResponseService) {

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
    type: {
      required: true
    },
    message: {
      required: true
    },
    detail: {
      required: true
    }
  };

  var getAll = function(req, res) {

    var tests = testsService.findAll();

    res.status(200);
    res.send(tests);

  };

  var getOne = function(req, res) {

    var test = testsService.findOne(req.params.id);

    res.status(200);
    res.send(test);

  };


  var post = function(req, res) {

    var errors = httpResponseService.validateRequest(req.body, _fieldRules);

    if (errors.length > 0) {
      var status = 422;
      res.status(status);
      res.send(httpResponseService.assembleErrorResponse(status, errors));
      return;
    }

    var newTest = {
      type: req.body.type,
      message: req.body.message,
      detail: req.body.detail
    };

    var tests = testsService.create(newTest);

    res.status(200);
    res.send(tests);

  };

  var put = function(req, res) {

    var errors = httpResponseService.validateRequest(req.body, _fieldRules);

    if (errors.length > 0) {
      var status = 422;
      res.status(status);
      res.send(httpResponseService.assembleErrorResponse(status, errors));
      return;
    }

    var updatedTest = {
      type: req.body.type,
      message: req.body.message,
      detail: req.body.detail
    };

    var tests = testsService.update(req.params.id, updatedTest);

    res.status(200);
    res.send(tests);

  };

  var del = function(req, res) {

    var tests = testsService.destroy(req.params.id);

    res.status(200);
    res.send(tests);

  };

  return {
    getAll: getAll,
    getOne: getOne,
    post: post,
    put: put,
    del: del
  }

};

module.exports = testsController;
