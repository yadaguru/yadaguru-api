var baseRemindersController = function(baseRemindersService, httpResponseService) {

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
    message: {
      required: true
    },
    detail: {
      required: true
    },
    lateMessage: {
      required: false
    },
    lateDetail: {
      required: false
    },
    timeframes: {
      required: true,
      message: 'timeframes must be an array of timeframe IDs',
      validate: function(value) {
        if (value.constructor !== Array || value.length === 0) {
          return false;
        }
        return value.every(function(el) {
          return typeof el === 'number';
        })
      }
    },
    category: {
      required: true,
      message: 'category must be a category ID',
      validate: function(value) {
        return typeof value === 'number';
      }
    }
  };


  /**
   * GET /api/base-reminders/
   */
  var get = function(req, res) {

    var baseReminders = baseRemindersService.findAll();

    res.status(200);
    res.send(baseReminders);

  };

  /**
   * GET /api/base-reminders/{baseReminderId}
   */
  var getById = function(req, res) {

    var id = req.params.baseReminderId;
    var baseReminder = baseRemindersService.findById(id);

    if (baseReminder) {
      res.status(200);
      res.send(baseReminder);
    } else {
      res.status(404);
      res.send(httpResponseService.assemble404Response('baseReminder', id));
    }

  };


  /**
   * POST /api/base-reminders/
   */
  var post = function(req, res) {

    var errors = httpResponseService.validateRequest(req.body, _fieldRules);

    if (errors.length > 0) {
      var status = 422;
      res.status(status);
      res.send(httpResponseService.assembleErrorResponse(status, errors));
      return;
    }

    var newBaseReminder = {
      name: req.body.name,
      message: req.body.message,
      detail: req.body.detail,
      lateMessage: req.body.lateMessage,
      lateDetail: req.body.lateDetail,
      timeframes: req.body.timeframes,
      category: req.body.category
    };

    var baseReminders = baseRemindersService.create(newBaseReminder);
    res.status(200);
    res.send(baseReminders);

  };

  /**
   * PUT /api/baseReminders/{baseReminderId}
   */
  var putOnId = function(req, res) {

    var errors = httpResponseService.validateRequest(req.body, _fieldRules);

    if (errors.length > 0) {
      var status = 422;
      res.status(status);
      res.send(httpResponseService.assembleErrorResponse(status, errors));
      return;
    }

    var updatedBaseReminder = {
      name: req.body.name,
      message: req.body.message,
      detail: req.body.detail,
      lateMessage: req.body.lateMessage,
      lateDetail: req.body.lateDetail,
      timeframes: req.body.timeframes,
      category: req.body.category
    };
    var id = req.params.baseReminderId;

    if (baseRemindersService.exists(id)) {
      var baseReminders = baseRemindersService.update(id, updatedBaseReminder);
      res.status(200);
      res.send(baseReminders);
    } else {
      res.status(404);
      res.send(httpResponseService.assemble404Response('baseReminder', id));
    }

  };

  /**
   * DELETE /api/baseReminders/{baseReminderId}
   */
  var remove = function(req, res) {

    var id = req.params.baseReminderId;

    if (baseRemindersService.exists(id)) {
      var baseReminders = baseRemindersService.remove(req.params.id);
      res.status(200);
      res.send(baseReminders);
    } else {
      res.status(404);
      res.send(httpResponseService.assemble404Response('baseReminder', id));
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

module.exports = baseRemindersController;
