/* globals describe, beforeEach, it, afterEach */
var sinon = require('sinon');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');
chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.should();
var errors = require('../../services/errorService');
var Promise = require('bluebird');
var auth = require('../../services/authService');
var proxyquire = require('proxyquire');
var mocks = require('../mocks');

describe('AdminUsers Controller', function() {
  describe('POST /admin_users', function() {
    var req, res, adminUsersController, getUserToken, yadaguruDataMock;

    beforeEach(function() {
      yadaguruDataMock = mocks.getYadaguruDataMock('adminUserService');
      yadaguruDataMock.stubMethods();
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      adminUsersController = proxyquire('../../controllers/adminUsersController', {
        'yadaguru-data': yadaguruDataMock.getMockObject()
      });
      getUserToken = sinon.stub(auth, 'getUserToken');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      getUserToken.restore();
      yadaguruDataMock.restoreStubs();
    });

    it('should respond with a 200 and a user token if username and password are correct', function() {
      req.body = {
        userName: 'admin',
        password: 'password'
      };

      yadaguruDataMock.services.adminUserService.stubs.verifyUser.withArgs('admin', 'password')
        .returns(Promise.resolve({id: 1}));

      getUserToken.withArgs(1, 'admin')
        .returns('Bearer a valid token');

      return adminUsersController.post(req, res).then(function() {
        res.json.should.have.been.calledWith({token: 'Bearer a valid token'});
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should respond with a 401 if the user does not exist', function() {
      req.body = {
        userName: 'admins',
        password: 'password'
      };

      yadaguruDataMock.services.adminUserService.stubs.verifyUser.withArgs('admins', 'password')
        .returns(Promise.resolve(false));

      var error = new errors.AdminLoginError();

      return adminUsersController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond with a 401 if the password is incorrect', function() {
      req.body = {
        userName: 'admin',
        password: 'passwords'
      };

      yadaguruDataMock.services.adminUserService.stubs.verifyUser.withArgs('admin', 'passwords')
        .returns(Promise.resolve(false));

      var error = new errors.AdminLoginError();

      return adminUsersController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(401);
      });
    });


    it('should respond with an error and 400 status on if username is missing', function() {
      req.body = {
        password: 'password'
      };

      var error = new errors.ValidationError([{
        field: 'userName',
        message: 'is required'
      }]);

      return adminUsersController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond with an error and 400 status on if password is missing', function() {
      req.body = {
        userName: 'admin'
      };

      var error = new errors.ValidationError([{
        field: 'password',
        message: 'is required'
      }]);

      return adminUsersController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.body = {
        userName: 'admin',
        password: 'password'
      };
      var databaseError = new Error('some database error');
      yadaguruDataMock.services.adminUserService.stubs.verifyUser.returns(Promise.reject(databaseError));

      return adminUsersController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(databaseError);
        res.status.should.have.been.calledWith(500);
      });
    });
  });
});
