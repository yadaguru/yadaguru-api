var env = process.env.NODE_ENV || 'development';
var config = require('../config/config.json')[env];
var timeframeService = require('yadaguru-data')(config).timeframeService;

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

var requiredRoles = {
  getAll: ['admin'],
  post: ['admin'],
  getById: ['admin'],
  putOnId: ['admin'],
  removeById: ['admin']
};

module.exports = require('./baseController')('Timeframe', timeframeService, schema, requiredRoles);
