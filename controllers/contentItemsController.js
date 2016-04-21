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

  /**
   * GET /api/content-items
   */
  var get = function(req, res) {

    var contentItems = contentItemsService.findAll();

    res.status(200);
    res.send(contentItems);

  };

  /**
   * GET /api/content-items/{contentItemId}
   */
  var getById = function(req, res) {

    var id = req.params.contentItemId;
    var contentItem = contentItemsService.findById(id);

    if (contentItem) {
      res.status(200);
      res.send(contentItem);
    } else {
      res.status(404);
      res.send(httpResponseService.assemble404Response('contentItem', id));
    }

  };


  /**
   * POST /api/content-items
   */
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

  /**
   * PUT /api/content-items/{contentItemId}
   */
  var putOnId = function(req, res) {

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
    var id = req.params.contentItemId;

    if (contentItemsService.exists(id)) {
      var contentItems = contentItemsService.update(id, updatedContentItem);
      res.status(200);
      res.send(contentItems);
    } else {
      res.status(404);
      res.send(httpResponseService.assemble404Response('contentItem', id));
    }


  };

  /**
   * DELETE /api/content-items/{contentItemId}
   */
  var remove = function(req, res) {

    var id = req.params.contentItemId;

    if (contentItemsService.exists(id)) {
      var contentItems = contentItemsService.remove(id);
      res.status(200);
      res.send(contentItems);
    } else {
      res.status(404);
      res.send(httpResponseService.assemble404Response('contentItem', id));
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

module.exports = contentItemsController;
