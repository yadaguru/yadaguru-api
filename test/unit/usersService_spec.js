// Inner libraries
var app = require('../../app.js');

// Testing libraries
var assert = require('assert');
var sinon = require('sinon');

describe('Users Service', function() {

  var fakeUserId = 9;

  var mockDatabase = {};

  var usersService;

  beforeEach(function() {
    mockDatabase.membership = {
      register: function(argList, callback) {
        var data = {};
        data.success = true;
        data.new_id = fakeUserId;
        data.message = 'Successfully registered';
        callback(null, [data]);
      }
    };

    sinon.stub(app, 'get').withArgs('db').returns(mockDatabase);

    // Unit under test
    usersService = require('../../services/usersService.js');
  });

  afterEach(function() {
    app.get.restore();
  });

  it('should return userId if phone_number is valid', function() {
    var callbackSpy = sinon.spy();
    usersService.create('1234567890', callbackSpy);
    assert.ok(callbackSpy.calledWith(null, { userId: fakeUserId }));
  });

  it('should accept phone numbers with formatting', function() {
    var callbackSpy = sinon.spy();
    usersService.create('(123) 456-7890', callbackSpy);
    assert.ok(callbackSpy.calledWith(null, { userId: fakeUserId }));
  });

  it('should return error if phone_number is invalid', function() {
    var callbackSpy = sinon.spy();
    usersService.create('not_a_number', callbackSpy);
    assert.ok(callbackSpy.calledWith({ status: 400, message: 'Invalid Phone Number: Must be 10 digits' }, null));
  });

  it('should return 409 with message if phone number exists', function() {
    mockDatabase.membership.register = function(argList, callback) {
      var data = {};
      data.success = false;
      data.message = 'Phone number exists';
      callback(null, [data]);
    };

    var callbackSpy = sinon.spy();
    usersService.create('(123) 456-7890', callbackSpy);
    assert.ok(callbackSpy.calledWith({ status: 409, message: 'Phone number exists' }, null));
  });
});
