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
var userService = require('../../services/userService');

describe('Users Controller', function() {
  describe('POST /users', function() {
    var req, res, usersController, create;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      create = sinon.stub(userService, 'create');
      usersController = require('../../controllers/usersController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      create.restore();
    });

    it('should respond with new user object and 200 status on success', function() {
      req.body = {phoneNumber: '1234567890'};
      var successfulCreateResponse = {
        id: '1',
        phoneNumber: req.body.phoneNumber,
        confirmCode: '',
        confirmCodeTimestamp: '',
        sponsorCode: ''
      };
      create.returns(Promise.resolve([successfulCreateResponse]));

      return usersController.post(req, res).then(function() {
        res.json.should.have.been.calledWith([successfulCreateResponse]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should respond with a new user object and a 200 status, even if the phone number is formatted', function() {
      req.body = {phoneNumber: '(123) 456-7890'};
      var successfulCreateResponse = {
        id: '1',
        phoneNumber: '1234567890',
        confirmCode: '',
        confirmCodeTimestamp: '',
        sponsorCode: ''
      };
      create.returns(Promise.resolve([successfulCreateResponse]));

      return usersController.post(req, res).then(function() {
        res.json.should.have.been.calledWith([successfulCreateResponse]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should respond with an error and 400 status on if phone number is not formatted correctly', function() {
      req.body = {phoneNumber: '12345abcde'};
      var error = new errors.ValidationError([{
        field: 'phoneNumber',
        message: 'must be a string of 10 digits',
        value: '12345'
      }]);

      return usersController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond with an error and 400 status on if phone number is missing', function() {
      req.body = {foo: 'bar'};
      var error = new errors.ValidationError([{
        field: 'phoneNumber',
        message: 'is required'
      }]);

      return usersController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.body = {phoneNumber: '1234567890'};
      var databaseError = new Error('some database error');
      create.returns(Promise.reject(databaseError));

      return usersController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(databaseError);
        res.status.should.have.been.calledWith(500);
      });
    });
  });

  describe('PUT /users/:id', function() {
    var req, res, usersController, update;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      update = sinon.stub(userService, 'update');
      usersController = require('../../controllers/usersController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      update.restore();
    });

    it('should respond with the updated user object and 200 status on success', function() {
      req.body = {phoneNumber: '1234567890'};
      req.params = {id: 1};
      var updatedUser = {
        id: '1',
        phoneNumber: req.body.phoneNumber,
        confirmCode: '',
        confirmCodeTimestamp: '',
        sponsorCode: ''
      };
      update.withArgs(req.params.id, req.body)
        .returns(Promise.resolve([updatedUser]));

      return usersController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith([updatedUser]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should respond with an error and 400 status on if phone number is not formatted correctly', function() {
      req.body = {phoneNumber: '12345abcde'};
      req.params = {id: 1};
      var error = new errors.ValidationError([{
        field: 'phoneNumber',
        message: 'must be a string of 10 digits',
        value: '12345'
      }]);

      return usersController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      })
    });

    it('should respond with an error and 404 status if user does not exist', function() {
      req.body = {phoneNumber: '1234567890'};
      req.params = {id: 2};
      var error = new errors.ResourceNotFoundError('User', req.params.id);
      update.withArgs(req.params.id)
        .returns(Promise.resolve(false));

      return usersController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      })
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.body = {phoneNumber: '1234567890'};
      req.params = {id: 1};
      var error = new Error('database error');
      update.withArgs(req.params.id, req.body)
        .returns(Promise.reject(error));

      return usersController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      })
    });
  });

  describe('DELETE /users/:id', function() {
    var req, res, usersController, destroy;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      destroy = sinon.stub(userService, 'destroy');
      usersController = require('../../controllers/usersController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      destroy.restore();
    });

    it('should respond with the user ID and 200 status on success', function() {
      req.params = {id: 1};
      destroy.withArgs(req.params.id)
        .returns(Promise.resolve(true));

      return usersController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith([{deletedId: 1}]);
        res.status.should.have.been.calledWith(200);
      })
    });

    it('should respond with an error and 404 status if user does not exist', function() {
      req.params = {id: 2};
      var error = new errors.ResourceNotFoundError('User', req.params.id);
      destroy.withArgs(req.params.id)
        .returns(Promise.resolve(false));

      return usersController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      })
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.params = {id: 1};
      var error = new Error('database error');
      destroy.withArgs(req.params.id)
        .returns(Promise.reject(error));

      return usersController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      })
    });
  });
});
