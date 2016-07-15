var models = require('../models/');
var util = require('util');
var validators = require('../lib/validators');
var User = models.User;

var usersController = function() {

  var validationSchema = {
    phoneNumber: {
      required: true,
      rules: [{
        validator: 'isPhoneNumber',
        message: 'phoneNumber must be a string of 10 digits'
      }],
      sanitizers: ['sanitizeDigitString']
    },
    confirmCode: {
      rules: [{
        validator: 'isSixDigits',
        message: 'confirmCode must be a string of 6 digits'
      }],
      sanitizers: ['sanitizeDigitString']
    },
    sponsorCode: {
      required: false
    }
  };

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
    debugger;
    var validation = validators.sanitizeAndValidateAll(req.body, validationSchema);

    if (!validation.isValid) {
      res.status(400);
      res.json(validation.errors);
      return;
    }

    User.create({
      phoneNumber: validation.sanitizedData.phoneNumber
    }).then(function(resp) {
      res.status(200);
      res.json([resp.dataValues]);
    }).catch(function(error) {
      res.status(400);
      res.json(error);
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
