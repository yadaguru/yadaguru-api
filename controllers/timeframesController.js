var timeframesController = function(timeframesService, httpResponseService) {

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
    type: {
      required: true,
      message: 'type must be "absolute", "relative", or "now"',
      validate: function(value) {
        return ['absolute', 'relative', 'now'].indexOf(value) > -1;
      }
    },
    formula: {
      message: 'formula must be a positive integer if type is "relative" or an ISO8601 date if type is "absolute"',
      validate: function(value, validator, data) {
        if (data.type === 'relative') {
          return validator.isInt(data.formula, {min: 0});
        }
        if (data.type === 'absolute') {
          return validator.isISO8601(data.formula);
        }
        return true;
      }
    }
  };

  var getAll = function(req, res) {

    var timeframes = timeframesService.findAll();

    res.status(200);
    res.send(timeframes);

  };

  var getOne = function(req, res) {

    var timeframe = timeframesService.findOne(req.params.id);

    res.status(200);
    res.send(timeframe);

  };


  var post = function(req, res) {

    var errors = httpResponseService.validateRequest(req.body, _fieldRules);

    if (errors.length > 0) {
      var status = 422;
      res.status(status);
      res.send(httpResponseService.assembleErrorResponse(status, errors));
      return;
    }

    var newTimeframe = {
      name: req.body.name,
      type: req.body.type,
      formula: req.body.formula
    };

    var timeframes = timeframesService.create(newTimeframe);

    res.status(200);
    res.send(timeframes);

  };

  var put = function(req, res) {

    var errors = httpResponseService.validateRequest(req.body, _fieldRules);

    if (errors.length > 0) {
      var status = 422;
      res.status(status);
      res.send(httpResponseService.assembleErrorResponse(status, errors));
      return;
    }

    var updatedTimeframe = {
      name: req.body.name,
      type: req.body.type,
      formula: req.body.formula
    };

    var timeframes = timeframesService.update(req.params.id, updatedTimeframe);

    res.status(200);
    res.send(timeframes);

  };

  var del = function(req, res) {

    var timeframes = timeframesService.destroy(req.params.id);

    res.status(200);
    res.send(timeframes);

  };

  return {
    getAll: getAll,
    getOne: getOne,
    post: post,
    put: put,
    del: del
  }

};

module.exports = timeframesController;
