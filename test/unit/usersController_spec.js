var sinon = require('sinon');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');
chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.should();
var Promise = require('bluebird');
var ApiError = require('../../services/errorService').ApiError;

var usersController = require('../../controllers/usersController');
var usersService = require('../../services/usersService');


describe('Users Controller', function() {

  describe('GET requests', function() {
    var req, res, stub;

    req = {
      params: {
        id: 1
      }
    };

    beforeEach(function() {

      res = {
        status: sinon.spy(),
        send: sinon.spy()
      };

      stub = sinon.stub(usersService, 'findById');
    });

    afterEach(function() {
      res.send.reset();
      res.status.reset();
      stub.restore();
    });

    it('should respond with the matching user object and 200 status on success', function(done) {

      var user = {
        id: '1',
        phoneNumber: '1234567890',
        confirmCode: '123456',
        confirmCodeExpires: '',
        sponsorCode: ''
      };

      stub.returns(Promise.resolve(user));

      usersController.getById(req, res);

      process.nextTick(function() {
        res.send.should.have.been.calledWith(user);
        res.status.should.have.been.calledWith(200);
        done();
      })

    });

    it('should respond with error message and 404 status if user is missing', function(done) {

      var error = new ApiError();

      stub.returns(Promise.reject(error));

      usersController.getById(req, res);

      process.nextTick(function() {
        res.send.should.have.been.calledWith(error.message);
        res.status.should.have.been.calledWith(error.status);
        done();
      })

    });

  });

  describe('POST requests', function() {
    var req, res, stub;

    req = {
      body: {
        phoneNumber: '1234567890'
      }
    };


    beforeEach(function() {

      res = {
        status: sinon.spy(),
        send: sinon.spy()
      };

      stub = sinon.stub(usersService, 'create');
    });

    afterEach(function() {
      res.send.reset();
      res.status.reset();
      stub.restore();
    });

    it('should respond with new user object and 200 status on success', function(done) {

      var successfulCreateResponse = {
        id: '1',
        phoneNumber: req.body.phoneNumber,
        confirmCode: '',
        confirmCodeExpires: '',
        sponsorCode: ''
      };

      stub.returns(Promise.resolve(successfulCreateResponse));

      usersController.post(req, res);

      process.nextTick(function() {
        res.send.should.have.been.calledWith(successfulCreateResponse);
        res.status.should.have.been.calledWith(200);
        done();
      })

    });

    it('should respond with error message and 400 status on failure', function(done) {

      var error = new ApiError();

      stub.returns(Promise.reject(error));

      usersController.post(req, res);

      process.nextTick(function() {
        res.send.should.have.been.calledWith(error.message);
        res.status.should.have.been.calledWith(error.status);
        done();
      })

    });

  });

  describe('PUT requests', function() {
    var req, res, stub;

    req = {
      body: {
        confirmCode: '1234567890'
      },
      params: {
        id: 1
      }
    };


    beforeEach(function() {

      res = {
        status: sinon.spy(),
        send: sinon.spy()
      };

      stub = sinon.stub(usersService, 'update');
    });

    afterEach(function() {
      res.send.reset();
      res.status.reset();
      stub.restore();
    });

    it('should respond with new user object and 200 status on success', function(done) {

      var successfulUpdateResponse = {
        id: '1',
        phoneNumber: '1234567890',
        confirmCode: req.body.confirmCode,
        confirmCodeExpires: '',
        sponsorCode: ''
      };

      stub.returns(Promise.resolve(successfulUpdateResponse));

      usersController.putOnId(req, res);

      process.nextTick(function() {
        res.send.should.have.been.calledWith(successfulUpdateResponse);
        res.status.should.have.been.calledWith(200);
        done();
      })

    });

    it('should respond with error message and 400 status on failure', function(done) {

      var error = new ApiError();

      stub.returns(Promise.reject(error));

      usersController.putOnId(req, res);

      process.nextTick(function() {
        res.send.should.have.been.calledWith(error.message);
        res.status.should.have.been.calledWith(error.status);
        done();
      })

    });

  });

});
