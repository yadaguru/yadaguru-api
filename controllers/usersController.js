var models = require('./index');
var util = require('util');

var usersController = function() {

  var usersService = require('../services/usersService');

  ///**
  // * GET /users/
  // */
  //var getAll = function(req, res) {
  //  return usersService.findAll().then(function(data) {
  //    res.status(200);
  //    res.send(data);
  //  }).catch(function(ApiError) {
  //    res.status(ApiError.status);
  //    res.send(ApiError.message);
  //  })
  //};

  ///**
  // * GET /users/:id
  // */
  //var getById = function(req, res) {
  //  return usersService.findById(req.params.id).then(function(data) {
  //    res.status(200);
  //    res.send(data);
  //  }).catch(function(ApiError) {
  //    res.status(ApiError.status);
  //    res.send(ApiError.message);
  //  })
  //};

  /**
   * POST /users
   */
  var post = function(req, res) {
    req.sanitize('phoneNumber').sanitizePhoneNumber();
    req.checkBody('phoneNumber', 'Phone Number must be 10 digits').isPhoneNumber();
    var errors = req.validationErrors();
    if (errors) {
      res.status(400);
      res.json({errors: errors});
      return;
    }

    models.User.create({
      phoneNumber: req.body.phoneNumber
    }).then(function(user) {
      res.json(user);
    }).catch(function(error) {
      res.status(400);
      res.json({errors: error.errors});
    });
  };

  ///**
  // * PUT /users/id
  // */
  //var putOnId = function(req, res) {
  //  return usersService.update(req.params.id, req.body).then(function(data) {
  //    res.status(200);
  //    res.send(data);
  //  }).catch(function(ApiError) {
  //    res.status(ApiError.status);
  //    res.send(ApiError.message);
  //  });
  //};

  ///**
  // * DELETE /users/:id
  // */
  //var removeById = function(req, res) {
  //  return usersService.destroy(req.params.id).then(function(data) {
  //    res.status(200);
  //    res.send(data);
  //  }).catch(function(ApiError) {
  //    res.status(ApiError.status);
  //    res.send(ApiError.message);
  //  })
  //};

  return {
    //getAll: getAll,
    //getById: getById,
    post : post
    //putOnId : putOnId,
    //removeById : removeById
  };
};

module.exports = usersController();
