var express = require('express');
var router = express.Router();

var categories = [
  {
    id: 1,
    category: 'foo'
  },
  {
    id: 2,
    category: 'bar'
  }
];

/**
 * Gets all categories
 */
router.get('/', function(req, res, next) {

  // some call to database

  res.status(200).send(categories);

});

/**
 * Gets one category
 */
router.get('/:id', function(req, res, next) {

  var id = req.params.id;

});

/**
 * Creates a category
 */
router.post('/', function(req, res, next) {

  var categoryName = req.body.name;

});

/**
 * Updates a category
 */
router.put('/:id', function(req, res, next) {


});

/**
 * Deletes a category
 */
router.delete('/:id', function(req, res, next) {


});

module.exports = router;
