var env = process.env.NODE_ENV || 'development';
var config = require('../config/config.json')[env];
var categoryService = require('yadaguru-data')(config).categoryService;

var schema = {
  name: {
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

module.exports = require('./baseController')('Category', categoryService, schema, requiredRoles);
