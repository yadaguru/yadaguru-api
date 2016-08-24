var timeframeService = require('../services/timeframeService');

var schema = {
  name: {
    required: true
  },
  type: {
    required: true,
    rules: [{
      validator: 'isValidTimeframeType',
      message: 'must be one of the following: "now", "absolute", or "relative'
    }]
  },
  formula: {
    rules: [{
      validator: 'isValidFormulaForType',
      message: 'must be a valid date if type is "absolute", or must be a number if type is "relative"'
    }]
  }
};

module.exports = require('./baseController')('Timeframe', timeframeService, schema);
