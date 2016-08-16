var categoryService = require('../services/categoryService');

var schema = {
  name: {
    required: true
  }
};

module.exports = require('./baseController')('Category', categoryService, schema);
