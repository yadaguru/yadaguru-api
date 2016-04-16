'use strict';

var assert = require('chai').assert;

var httpResponseService = require('../../services/httpResponseService.js')();

describe('httpResponseService.hasRequiredFields', function() {

  it('should return true if all items in the requiredFields array are present as keys on the data object', function() {

    var data = {
      foo: 1,
      bar: 2,
      bazz: 3
    };

    var requiredFields = [
      'foo',
      'bar'
    ];

    var isValid = httpResponseService.hasRequiredFields(data, requiredFields);
    assert.isOk(isValid);

  });

  it('should return false if item(s) in the requiredFields array are not present as keys the data object', function() {

    var data = {
      foo: 1,
      bazz: 3
    };

    var requiredFields = [
      'foo',
      'bar'
    ];

    var isValid = httpResponseService.hasRequiredFields(data, requiredFields);
    assert.isNotOk(isValid);

  });

});

describe('httpResponseService.getMissingFieldsResponse', function() {

  var fields = ['foo', 'bar'];

  it('should return an object with a status property of 422 and a message stating required fields', function() {

    var badRequestMessage = httpResponseService.getMissingFieldsResponse(fields);
    assert.equal(badRequestMessage.status, 422);
    assert.equal(badRequestMessage.message, 'The following fields are required: foo, bar');

  });

});

