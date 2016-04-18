'use strict';

var assert = require('chai').assert;

var httpResponseService = require('../../services/httpResponseService.js')();

describe('httpResponseService.validateRequest', function() {

  var rules = {
    myInt: {
      required: true,
      message: 'myInt must be an integer',
      validate: function(value, validator) {
        return validator.isInt(value);
      }
    },
    myString: {
      required: true,
      message: 'myString must be alphanumeric',
      validate: function(value, validator) {
        return validator.isAlphanumeric(value);
      }
    },
    myValue: {
      required: true
    },
    myOptionalValue: {
      validate: function(value, validator) {
        return validator.isBoolean(value);
      }
    }
  };

  it('should return an empty array if all data is valid', function() {

    var data = {
      myInt: '42',
      myString: 'foobar',
      myValue: 'anything'
    };

    var invalidData = httpResponseService.validateRequest(data, rules);
    assert.lengthOf(invalidData, 0);

  });

  it('should return an array of validation rules for invalid data', function() {

    var data = {
      myInt: '42.2',
      myString: 'foobar',
      myValue: 'anything'
    };

    var invalidData = httpResponseService.validateRequest(data, rules);
    assert.equal(invalidData[0], 'myInt must be an integer');

  });

  it('should also catch missing fields', function() {

    var data = {
      myInt: '42',
      myValue: 'anything'
    };

    var invalidData = httpResponseService.validateRequest(data, rules);
    assert.equal(invalidData[0], 'myString is required');

  });

  it('can handle a validation rule with no message', function() {

    var data = {
      myInt: '42',
      myString: 'foobar',
      myValue: 'anything',
      myOptionalValue: 'notaboolean'
    };

    var invalidData = httpResponseService.validateRequest(data, rules);
    assert.equal(invalidData[0], 'myOptionalValue is not valid');

  });

  it('returns required messages for all required fields if an empty body is passed', function() {

    var data = {};

    var invalidData = httpResponseService.validateRequest(data, rules);
    assert.equal(invalidData[0], 'myInt is required');
    assert.equal(invalidData[1], 'myString is required');
    assert.equal(invalidData[2], 'myValue is required');

  });

  it('can return mixed required and valid messages', function() {

    var data = {
      myString: '######',
      myValue: 'anything',
      myOptionalValue: 'notaboolean'
    };

    var invalidData = httpResponseService.validateRequest(data, rules);
    assert.equal(invalidData[0], 'myInt is required');
    assert.equal(invalidData[1], 'myString must be alphanumeric');
    assert.equal(invalidData[2], 'myOptionalValue is not valid');
  });

  it('can handle an optional parameter with no defined rule', function() {

    var data = {
      myInt: '42',
      myString: 'foobar',
      myValue: 'anything',
      myExtraValue: 'extra'
    };

    var invalidData = httpResponseService.validateRequest(data, rules);
    assert.lengthOf(invalidData, 0);

  })

});

describe('httpResponseService.assembleErrorResponse', function() {

  it('should return an object containing the status code and an array of errors', function() {

    var errors = ['foo', 'bar'];
    var response = httpResponseService.assembleErrorResponse(422, errors);
    assert.equal(response.status, 422);
    assert.equal(response.errors[0], 'foo');
    assert.equal(response.errors[1], 'bar');

  });

});


