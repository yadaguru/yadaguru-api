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
var auth = require('../../services/authService');

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
      generateConfirmCode = sinon.stub(auth, 'generateConfirmCode');
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

  describe('PUT /users/:id', function() {
    var req, res, usersController, reqGet, getUserData, findById, getUserToken, update;

    beforeEach(function() {
      req = {
        get: function(){}
      };
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      reqGet = sinon.stub(req, 'get');
      getUserData = sinon.stub(auth, 'getUserData');
      findById = sinon.stub(userService, 'findById');
      getUserToken = sinon.stub(auth, 'getUserToken');
      update = sinon.stub(userService, 'update');
      usersController = require('../../controllers/usersController');
      this.clock = sinon.useFakeTimers();
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      reqGet.restore();
      getUserData.restore();
      findById.restore();
      getUserToken.restore();
      update.restore();
      this.clock.restore();
    });

    it('should respond access token and 200 status if confirm code is in body and matches and is not expired.', function() {
      req.body = {confirmCode: '123456'};
      req.params = {id: 1};
      findById.withArgs(1)
        .returns(Promise.resolve([{
          id: 1,
          confirmCode: '123456',
          confirmCodeTimestamp: '1970-01-01T00:00:00Z'
        }]));
      getUserToken.withArgs(1, 'user')
        .returns('a valid user token');

      this.clock.tick(10000);

      return usersController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith({token: 'a valid user token'});
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should update the user and respond with updated user and 200 status if confirmCode is not passed.', function() {
      req.body = {sponsorCode: '123456'};
      req.params = {id: 1};

      var updatedUser = {
        id: 1,
        phoneNumber: '1234567890',
        sponsorCode: '123456',
        createdAt: 'ISO timestamp',
        updatedAt: 'ISO timestamp'
      };

      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'user'});

      update.withArgs(1, {sponsorCode: '123456'})
        .returns(Promise.resolve([updatedUser]));

      return usersController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith([updatedUser]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should respond with an error and 400 status if confirm code does not match.', function() {
      req.body = {confirmCode: '654321'};
      req.params = {id: 1};
      findById.withArgs(1)
        .returns(Promise.resolve([{
          id: 1,
          confirmCode: '123456',
          confirmCodeTimestamp: '1970-01-01T00:00:00Z'
        }]));
      var error = new errors.LoginError();

      this.clock.tick(10000);

      return usersController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond with an error and 400 status if confirm code has expired.', function() {
      req.body = {confirmCode: '123456'};
      req.params = {id: 1};
      findById.withArgs(1)
        .returns(Promise.resolve([{
          id: 1,
          confirmCode: '123456',
          confirmCodeTimestamp: '1970-01-01T00:00:00Z'
        }]));
      var error = new errors.LoginError();

      this.clock.tick(70000);

      return usersController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
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

    it('should respond with an error and 401 status if user does not match token', function() {
      req.body = {phoneNumber: '1234567890'};
      req.params = {id: 2};
      var error = new errors.NotAuthorizedError();
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'user'});

      update.withArgs(req.params.id)
        .returns(Promise.resolve(false));

      return usersController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(401);
      })
    });

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      req.body = {phoneNumber: '1234567890'};
      req.params = {id: 2};
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});

      return usersController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      req.body = {phoneNumber: '1234567890'};
      req.params = {id: 2};
      reqGet.withArgs('Authorization')
        .returns('Bearer an invalid token');
      getUserData.withArgs('Bearer an invalid token')
        .returns(false);

      return usersController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.body = {phoneNumber: '1234567890'};
      req.params = {id: 1};
      var error = new Error('database error');
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'user'});

      update.withArgs(req.params.id, req.body)
        .returns(Promise.reject(error));

      return usersController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      })
    });
  });

  describe('DELETE /users/:id', function() {
    var req, res, reqGet, getUserData, usersController, destroy;

    beforeEach(function() {
      req = {
        get: function(){}
      };
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      reqGet = sinon.stub(req, 'get');
      getUserData = sinon.stub(auth, 'getUserData');
      destroy = sinon.stub(userService, 'destroy');
      usersController = require('../../controllers/usersController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      reqGet.restore();
      getUserData.restore();
      destroy.restore();
    });

    it('should respond with the user ID and 200 status on success', function() {
      req.params = {id: 1};
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'user'});
      destroy.withArgs(req.params.id)
        .returns(Promise.resolve(true));

      return usersController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith([{deletedId: 1}]);
        res.status.should.have.been.calledWith(200);
      })
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.params = {id: 1};
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'user'});
      var error = new Error('database error');
      destroy.withArgs(req.params.id)
        .returns(Promise.reject(error));

      return usersController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      })
    });

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});

      req.params = {id: 1};
      return usersController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer an invalid token');
      getUserData.withArgs('Bearer an invalid token')
        .returns(false);

      req.params = {id: 1};
      return usersController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });
  });
});
