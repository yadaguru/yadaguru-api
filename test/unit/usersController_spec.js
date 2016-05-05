// Inner libraries
var usersService = require('../../services/usersService');

// Testing libraries
var assert = require('assert');
var sinon = require('sinon');

describe('Users Controller', function() {

  var fakeUserId = 7;

  var usersController;

  beforeEach(function() {
    // Unit under test
    usersController = require('../../controllers/usersController.js');
  });

  afterEach(function() {
  });

  it('should return user id in response when userService returns data', function() {

    sinon.stub(usersService, 'create', function(phoneNumber, callback) {
      var data = {};
      data.userId = fakeUserId;
      callback(null, data);
    });

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

    usersService.create.restore();
  });

  it('should return error in response when userService returns error', function() {

    var errorMessage = 'Some helpful message hopefully';

    sinon.stub(usersService, 'create', function(phoneNumber, callback) {
      var error = {};
      error.status = 500;
      error.message = errorMessage;
      callback(error, null);
    });

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

    usersService.create.restore();
  });

  it('should return a user id in response on successful PUT', function() {

    sinon.stub(usersService, 'update', function(userId, phoneNumber, confirmCode, personalCode, sponsorCode, callback) {
      var data = {};
      data.userId = fakeUserId;
      callback(null, data);
    });

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

    usersService.update.restore();
  });
});
