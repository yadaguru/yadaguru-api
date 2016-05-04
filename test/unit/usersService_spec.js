'use strict';

var assert = require('assert');
var sinon = require('sinon');

describe('Users Service', function() {

  var fakeUserId = 9;

  var mockDatabase = {};
  mockDatabase.membership = {
    register: function(argList, callback) {
      var data = {};
      data.success = true;
      data.new_id = fakeUserId;
      data.message = 'Successfully registered';
      callback(null, data);
    }
  };

  var usersService = require('../../services/usersService.js')(mockDatabase);

  it('should return userId if phone_number is valid', function() {
    var callbackSpy = sinon.spy();
    usersService.create('1234567890', callbackSpy);
    assert.ok(callbackSpy.calledWith(null, { userId: fakeUserId }));
  });

  it('should return error if phone_number is invalid', function() {
    var callbackSpy = sinon.spy();
    usersService.create('not_a_number', callbackSpy);
    assert.ok(callbackSpy.calledWith({ status: 400, message: 'Invalid Phone Number' }, null));
  });

  it('should accept phone numbers with formatting', function() {
    var callbackSpy = sinon.spy();
    usersService.create('(123) 456-7890', callbackSpy);
    assert.ok(callbackSpy.calledWith(null, { userId: fakeUserId }));
  });
});
