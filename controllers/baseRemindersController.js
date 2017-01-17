var env = process.env.NODE_ENV || 'development';
var config = require('../config/config.json')[env];
var baseReminderService = require('yadaguru-data')(config).baseReminderService;

var schema = {
  name: {
    required: true
  },
  message: {
    required: true
  },
  smsMessage: {
    required: true,
    rules: [{
      validator: 'isLength',
      options: {max: 28},
      message: 'must be 28 characters or shorter'
    }]
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
  categoryId: {
    required: true,
    rules: [{
      validator: 'isNumeric',
      message: 'must be a number'
    }]
  },
  timeframeIds: {
    required: true,
    rules: [{
      validator: 'isArrayOfNumbers',
      message: 'must be an array of timeframe IDs'
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

module.exports = require('./baseController')('BaseReminder', baseReminderService, schema, requiredRoles);
