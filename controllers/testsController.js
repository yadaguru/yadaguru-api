var env = process.env.NODE_ENV || 'development';
var config = require('../config/config.json')[env];
var testService = require('yadaguru-data')(config).testService;

var schema = {
  type: {
    required: true
  },
  registrationMessage: {
    required: true
  },
  registrationDetail: {
    required: true
  },
  adminMessage: {
    required: true
  },
  adminDetail: {
    required: true
  }
};

var requiredRoles = {
  getAll: ['admin'],
  post: ['admin'],
  getById: ['admin'],
  putOnId: ['admin'],
  removeById: ['admin']
};

module.exports = require('./baseController')('Test', testService, schema, requiredRoles);
