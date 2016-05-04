'use strict';

var assert = require('assert');
var sinon = require('sinon');

var mockDatabase = {};
var usersService = require('../../services/usersService.js')(mockDatabase);

describe('Users Service', function() {
  it('should return userId if phone_number is valid', function() {

    var fakeUserId = 9;

    mockDatabase.membership = {
      register: function(argList, callback) {
        var data = {};
        data.success = true;
        data.new_id = fakeUserId;
        data.message = 'Successfully registered';
        callback(null, data);
      }
    };

    var callbackSpy = sinon.spy();
    usersService.create('1234567890', callbackSpy);
    assert.ok(callbackSpy.calledWith(null, { userId: fakeUserId }));
  });
});
