var Category = require('../models/').Category;
var categoryService = require('./baseDbService')(Category);

module.exports = categoryService;
