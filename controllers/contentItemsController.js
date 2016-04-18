var contentItemsController = function(contentItemsService, httpResponseService) {

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
    },
    content: {
      required: true
    }
  };

  var getAll = function(req, res) {

    var contentItems = contentItemsService.findAll();

    res.status(200);
    res.send(contentItems);

  };

  var getOne = function(req, res) {

    var contentItem = contentItemsService.findOne(req.params.id);

    res.status(200);
    res.send(contentItem);

  };


  var post = function(req, res) {

    var errors = httpResponseService.validateRequest(req.body, _fieldRules);

    if (errors.length > 0) {
      var status = 422;
      res.status(status);
      res.send(httpResponseService.assembleErrorResponse(status, errors));
      return;
    }

    var newContentItem = {
      name: req.body.name,
      content: req.body.content
    };

    var contentItems = contentItemsService.create(newContentItem);

    res.status(200);
    res.send(contentItems);

  };

  var put = function(req, res) {

    var errors = httpResponseService.validateRequest(req.body, _fieldRules);

    if (errors.length > 0) {
      var status = 422;
      res.status(status);
      res.send(httpResponseService.assembleErrorResponse(status, errors));
      return;
    }

    var updatedContentItem = {
      name: req.body.name,
      content: req.body.content
    };

    var contentItems = contentItemsService.update(req.params.id, updatedContentItem);

    res.status(200);
    res.send(contentItems);

  };

  var del = function(req, res) {

    var contentItems = contentItemsService.destroy(req.params.id);

    res.status(200);
    res.send(contentItems);

  };

  return {
    getAll: getAll,
    getOne: getOne,
    post: post,
    put: put,
    del: del
  }

};

module.exports = contentItemsController;
