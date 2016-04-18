var categoriesController = function(categoriesService, httpResponseService) {

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
    name: {
      required: true
    }
  };

  var getAll = function(req, res) {

    var categories = categoriesService.findAll();

    res.status(200);
    res.send(categories);

  };

  var getOne = function(req, res) {

    var category = categoriesService.findOne(req.params.id);

    res.status(200);
    res.send(category);

  };


  var post = function(req, res) {

    var errors = httpResponseService.validateRequest(req.body, _fieldRules);

    if (errors.length > 0) {
      var status = 422;
      res.status(status);
      res.send(httpResponseService.assembleErrorResponse(status, errors));
      return;
    }

    var newCategory = {
      name: req.body.name
    };

    var categories = categoriesService.create(newCategory);

    res.status(200);
    res.send(categories);

  };

  var put = function(req, res) {

    var errors = httpResponseService.validateRequest(req.body, _fieldRules);

    if (errors.length > 0) {
      var status = 422;
      res.status(status);
      res.send(httpResponseService.assembleErrorResponse(status, errors));
      return;
    }

    var updatedCategory = {
      name: req.body.name
    };

    var categories = categoriesService.update(req.params.id, updatedCategory);

    res.status(200);
    res.send(categories);

  };

  var del = function(req, res) {

    var categories = categoriesService.destroy(req.params.id);

    res.status(200);
    res.send(categories);

  };

  return {
    getAll: getAll,
    getOne: getOne,
    post: post,
    put: put,
    del: del
  }

};

module.exports = categoriesController;
