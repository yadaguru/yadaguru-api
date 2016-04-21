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

  /**
   * GET /api/categories
   */
  var get = function(req, res) {

    var categories = categoriesService.findAll();

    res.status(200);
    res.send(categories);

  };

  /**
   * GET /api/categories/{categoryId}
   */
  var getById = function(req, res) {

    var id = req.params.categoryId;
    var category = categoriesService.findById(id);

    if (category) {
      res.status(200);
      res.send(category);
    } else {
      res.status(404);
      res.send(httpResponseService.assemble404Response('category', id));
    }

  };

  /**
   * POST /api/categories/
   */
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

  /**
   * PUT /api/categories/{categoryId}
   */
  var putOnId = function(req, res) {

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
    var id = req.params.categoryId;

    if (categoriesService.exists(id)) {
      var categories = categoriesService.update(id, updatedCategory);
      res.status(200);
      res.send(categories);
    } else {
      res.status(404);
      res.send(httpResponseService.assemble404Response('category', id));
    }


  };

  /**
   * DELETE /api/categories/{categoryId}
   */
  var remove = function(req, res) {

    var id = req.params.categoryId;


    if (categoriesService.exists(id)) {
      var categories = categoriesService.remove(req.params.categoryId);
      res.status(200);
      res.send(categories);
    } else {
      res.status(404);
      res.send(httpResponseService.assemble404Response('category', id));
    }


  };

  return {
    get: get,
    getById: getById,
    post: post,
    putOnId: putOnId,
    remove: remove
  }

};

module.exports = categoriesController;
