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


  var getAll = function(req, res) {

    var baseReminders = baseRemindersService.findAll();

    res.status(200);
    res.send(baseReminders);

  };

  var getOne = function(req, res) {

    var baseReminder = baseRemindersService.findOne(req.params.id);

    res.status(200);
    res.send(baseReminder);

  };


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

  var put = function(req, res) {

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

    var baseReminders = baseRemindersService.update(req.params.id, updatedBaseReminder);

    res.status(200);
    res.send(baseReminders);

  };

  var del = function(req, res) {

    var baseReminders = baseRemindersService.destroy(req.params.id);

    res.status(200);
    res.send(baseReminders);

  };

  return {
    getAll: getAll,
    getOne: getOne,
    post: post,
    put: put,
    del: del
  }

};

module.exports = baseRemindersController;
