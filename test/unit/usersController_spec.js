'use strict';

var assert = require('assert');
var sinon = require('sinon');

var fakeUserId = 7;
var mockUserService = {};
var usersController = require('../../controllers/usersController.js')(mockUserService);

describe('Users Controller', function() {
  it('should return user id in response when userService returns data', function() {

    mockUserService.create = function(phoneNumber, callback) {
      var data = {};
      data.userId = fakeUserId;
      callback(null, data);
    };

    var req = {
      body: {
        phoneNumber: '1234567890'
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    usersController.post(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith({id: fakeUserId}));
  });

  it('should return error in response when userService returns error', function() {

    var errorMessage = 'Some helpful message hopefully';

    mockUserService.create = function(phoneNumber, callback) {
      var error = {};
      error.status = 500;
      error.message = errorMessage;
      callback(error, null);
    };

    var req = {
      body: {
        phoneNumber: 'this is not a phone number but that does not matter'
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    usersController.post(req, res);
    assert.ok(res.status.calledWith(500));
    assert.ok(res.send.calledWith({error: errorMessage}));
  });

  it('should return a user id in response on successful PUT', function() {

    mockUserService.update = function(userId, phoneNumber, confirmCode, personalCode, sponsorCode, callback) {
      var data = {};
      data.userId = fakeUserId;
      callback(null, data);
    };

    var req = {
      params: { userId: fakeUserId},
      body: {
        phoneNumber: 'this is not a phone number but that does not matter',
        confirmCode: 'Some cool confirmation code',
        personalCode: 'A bit too personal of a code',
        sponsorCode: 'I approve of this request'
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    usersController.putOnId(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith({id: fakeUserId}));
  });
});
