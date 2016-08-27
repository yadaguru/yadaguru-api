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
    var req, res, usersController, create, getUserByPhoneNumber, user, save, generateConfirmCode;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      create = sinon.stub(userService, 'create');
      getUserByPhoneNumber = sinon.stub(userService, 'getUserByPhoneNumber');
      user = {
        save: function() {}
      };
      save = sinon.stub(user, 'save');
      usersController = require('../../controllers/usersController');
      generateConfirmCode = sinon.stub(usersController, 'generateConfirmCode');
      this.clock = sinon.useFakeTimers();
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      create.restore();
      getUserByPhoneNumber.restore();
      save.restore();
      generateConfirmCode.restore();
      this.clock.restore();
    });

    it('should create user if matching phone number does not exist, and respond with status 200 & the new user id', function() {
      req.body = {phoneNumber: '1234567890'};

      getUserByPhoneNumber.withArgs('1234567890')
        .returns(Promise.resolve(null));

      generateConfirmCode.returns('123456');

      create.withArgs({
        phoneNumber: '1234567890',
        confirmCode: '123456',
        confirmCodeTimestamp: '1970-01-01T00:00:00Z'
      }).returns(Promise.resolve([{id: '1', confirmCode: '123456'}]));

      return usersController.post(req, res).then(function() {
        res.json.should.have.been.calledWith({userId: '1'});
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should update user if matching phone number exists, and respond with status 200 & the new user id', function() {
      req.body = {phoneNumber: '1234567890'};

      getUserByPhoneNumber.withArgs('1234567890')
        .returns(Promise.resolve(user));

      generateConfirmCode.returns('123456');

      save
        .returns(Promise.resolve({'id': '1', confirmCode: '123456'}));

      return usersController.post(req, res).then(function() {
        res.json.should.have.been.calledWith({userId: '1'});
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should create (or update) user even if phone number is not formatted correctly', function() {
      req.body = {phoneNumber: '(123) 456-7890'};

      getUserByPhoneNumber.withArgs('1234567890')
        .returns(Promise.resolve(null));

      generateConfirmCode.returns('123456');

      create.withArgs({
        phoneNumber: '1234567890',
        confirmCode: '123456',
        confirmCodeTimestamp: '1970-01-01T00:00:00Z'
      }).returns(Promise.resolve([{id: '1', confirmCode: '123456'}]));

      return usersController.post(req, res).then(function() {
        res.json.should.have.been.calledWith({userId: '1'});
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
      getUserByPhoneNumber.returns(Promise.reject(databaseError));

      return usersController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(databaseError);
        res.status.should.have.been.calledWith(500);
      });
    });
  });

  xdescribe('PUT /users/:id', function() {
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

  xdescribe('DELETE /users/:id', function() {
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

  describe('The generateConfirmCode function', function() {
    it('should be six digits long', function() {
      var usersController = require('../../controllers/usersController');
      var code = usersController.generateConfirmCode();

      code.length.should.equal(6);
    })
  })
});
