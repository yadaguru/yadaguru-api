'use strict';

var assert = require('assert');
var sinon = require('sinon');
var httpMocks = require('node-mocks-http');

var fakeUserId = 7;

var mockUserService = {
    create: function() {
        return fakeUserId;
    }
}

var usersController = require('../../controllers/usersController.js')(mockUserService);

describe('User Controller', function() {
    it('should return user id when creating with valid phone number', function() {
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
        assert.ok(res.send.calledWith({ id: fakeUserId }));
    });
});
