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
var User = require('../../models').User;



describe('Users Controller', function() {
  describe('GET /users', function() {
    var req, res, usersController, findAll;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      findAll = sinon.stub(User, 'findAll');
      usersController = require('../../controllers/usersController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      findAll.restore();
    });

    it('should respond with an array of all users and a 200 status', function() {
      var users = [{
        id: '1',
        phoneNumber: '1234567890',
        confirmCode: '',
        confirmCodeExpires: '',
        sponsorCode: ''
      }, {
        id: '2',
        phoneNumber: '9876543210',
        confirmCode: '',
        confirmCodeExpires: '',
        sponsorCode: ''
      }];
      findAll.returns(Promise.resolve(users.map(
        function(user) {
          return {dataValues: user};
        }
      )));

      return usersController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith(users);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond with an empty array and a 200 status if there are no users', function() {
      findAll.returns(Promise.resolve([]));

      return usersController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith([]);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond with an error object and a 500 status on a database error', function() {
      var error = new Error('database error');
      findAll.returns(Promise.reject(error));

      return usersController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });

    });
  });

  describe('GET /users/:id', function() {
    var req, res, usersController, findById;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      findById = sinon.stub(User, 'findById');
      usersController = require('../../controllers/usersController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      findById.restore();
    });

    it('should respond with an array with the matching user and a 200 status', function() {
      req.params = {id: 1};
      var user = {
        id: '1',
        phoneNumber: '1234567890',
        confirmCode: '',
        confirmCodeExpires: '',
        sponsorCode: ''
      };
      findById.withArgs(1)
        .returns(Promise.resolve({dataValues: user}));

      return usersController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith([user]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should an error object and a 404 status if the user does not exist', function() {
      req.params = {id: 2};
      var error = new errors.ResourceNotFoundError('User', req.params.id);
      findById.withArgs(2)
        .returns(Promise.resolve(null));

      return usersController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      });

    });

    it('should respond with an error object and a 500 status on a database error', function() {
      req.params = {id: 1};
      var error = new Error('database error');
      findById.returns(Promise.reject(error));

      return usersController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });

    });
  });

  describe('POST /users', function() {
    var req, res, usersController, UserStub;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      UserStub = sinon.stub(User, 'create');
      usersController = require('../../controllers/usersController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      UserStub.restore();
    });

    it('should respond with new user object and 200 status on success', function() {
      req.body = {phoneNumber: '1234567890'};
      var successfulCreateResponse = {
        id: '1',
        phoneNumber: req.body.phoneNumber,
        confirmCode: '',
        confirmCodeExpires: '',
        sponsorCode: ''
      };
      UserStub.returns(Promise.resolve({dataValues: successfulCreateResponse}));

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
        confirmCodeExpires: '',
        sponsorCode: ''
      };
      UserStub.returns(Promise.resolve({dataValues: successfulCreateResponse}));

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
      UserStub.returns(Promise.reject(databaseError));

      return usersController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(databaseError);
        res.status.should.have.been.calledWith(500);
      });
    });
  });

  describe('PUT /users/:id', function() {
    var req, res, usersController, findById, user, update;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      findById = sinon.stub(User, 'findById');
      user = {update: function(values) {}};
      update = sinon.stub(user, 'update');
      usersController = require('../../controllers/usersController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      findById.restore();
      update.restore();
    });

    it('should respond with the updated user object and 200 status on success', function() {
      req.body = {phoneNumber: '1234567890'};
      req.params = {id: 1};
      var updatedUser = {
        id: '1',
        phoneNumber: req.body.phoneNumber,
        confirmCode: '',
        confirmCodeExpires: '',
        sponsorCode: ''
      };
      findById.withArgs(1)
        .returns(Promise.resolve(user));
      update.withArgs(req.body)
        .returns(Promise.resolve({dataValues: updatedUser}));

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
      findById.withArgs(1)
        .returns(Promise.resolve(user));

      return usersController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      })
    });

    it('should respond with an error and 404 status if user does not exist', function() {
      req.body = {phoneNumber: '1234567890'};
      req.params = {id: 2};
      var error = new errors.ResourceNotFoundError('User', req.params.id);
      findById.withArgs(2)
        .returns(Promise.resolve(null));

      return usersController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      })
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.body = {phoneNumber: '1234567890'};
      req.params = {id: 1};
      var error = new Error('database error');
      findById.withArgs(1)
        .returns(Promise.resolve(user));
      update.withArgs(req.body)
        .returns(Promise.reject(error));

      return usersController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      })
    });
  });

  describe('DELETE /users/:id', function() {
    var req, res, usersController, findById, user, destroy;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      findById = sinon.stub(User, 'findById');
      user = {destroy: function(values) {}};
      destroy = sinon.stub(user, 'destroy');
      usersController = require('../../controllers/usersController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      findById.restore();
      destroy.restore();
    });

    it('should respond with the user ID and 200 status on success', function() {
      req.params = {id: 1};
      findById.withArgs(1)
        .returns(Promise.resolve(user));
      destroy.withArgs()
        .returns(Promise.resolve());

      return usersController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith([{deletedId: 1}]);
        res.status.should.have.been.calledWith(200);
      })
    });

    it('should respond with an error and 404 status if user does not exist', function() {
      req.params = {id: 2};
      var error = new errors.ResourceNotFoundError('User', req.params.id);
      findById.withArgs(2)
        .returns(Promise.resolve(null));

      return usersController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      })
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.params = {id: 1};
      var error = new Error('database error');
      findById.withArgs(1)
        .returns(Promise.resolve(user));
      destroy.withArgs()
        .returns(Promise.reject(error));

      return usersController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      })
    });
  });
});
