var categoryService = require('../services/categoryService');

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
