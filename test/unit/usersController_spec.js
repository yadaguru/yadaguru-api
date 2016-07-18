/* globals describe, beforeEach, it, afterEach */
var sinon = require('sinon');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');
chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.should();
var Promise = require('bluebird');
var User = require('../../models').User;



describe('Users Controller', function() {
  describe('GET /users/', function() {
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

    it('should respond with an array of all users and a 200 status', function(done) {
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

      usersController.getAll(req, res);

      process.nextTick(function() {
        res.json.should.have.been.calledWith(users);
        res.status.should.have.been.calledWith(200);
        done();
      })
    });

    it('should return an empty array if there are no users', function(done) {
      findAll.returns(Promise.resolve([]));

      usersController.getAll(req, res);

      process.nextTick(function() {
        res.json.should.have.been.calledWith([]);
        res.status.should.have.been.calledWith(200);
        done();
      })
    });

    it('should return an error object and a 500 status on a database error', function(done) {
      var error = new Error('database error');
      findAll.returns(Promise.reject(error));

      usersController.getAll(req, res);

      process.nextTick(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
        done();
      })
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

    it('should respond with an array with the matching user and a 200 status', function(done) {
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

      usersController.getById(req, res);

      process.nextTick(function() {
        res.json.should.have.been.calledWith([user]);
        res.status.should.have.been.calledWith(200);
        done();
      })
    });

    it('should an error and a 404 status if the user does not exist', function(done) {
      req.params = {id: 2};
      var error = {
        message: 'User does not exist',
        id: req.params.id
      };
      findById.withArgs(2)
        .returns(Promise.resolve(null));

      usersController.getById(req, res);

      process.nextTick(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
        done();
      })
    });

    it('should return an error object and a 500 status on a database error', function(done) {
      req.params = {id: 1};
      var error = new Error('database error');
      findById.returns(Promise.reject(error));

      usersController.getById(req, res);

      process.nextTick(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
        done();
      })
    });
  });
  //describe('GET requests', function() {
  //  it('should respond with the matching user object and 200 status on success', function(done) {
  //    var req = {
  //      params: {
  //        id: 1
  //      }
  //    };
  //
  //    var user = {
  //      id: '1',
  //      phoneNumber: '1234567890',
  //      confirmCode: '123456',
  //      confirmCodeExpires: '',
  //      sponsorCode: ''
  //    };
  //
  //    findById
  //      .withArgs(1)
  //      .returns(Promise.resolve(user));
  //
  //    usersController.getById(req, res);
  //
  //    process.nextTick(function() {
  //      res.send.should.have.been.calledWith(user);
  //      res.status.should.have.been.calledWith(200);
  //      done();
  //    })
  //
  //  });
  //
  //  it('should respond with an array of all users and a 200 status on success', function(done) {
  //    var req = {};
  //
  //    var users = [{
  //      id: '1',
  //      phoneNumber: '1234567890',
  //      confirmCode: '123456',
  //      confirmCodeExpires: '',
  //      sponsorCode: ''
  //    }, {
  //      id: '2',
  //      phoneNumber: '9876543210',
  //      confirmCode: '654321',
  //      confirmCodeExpires: '',
  //      sponsorCode: ''
  //    }];
  //
  //    findAll.returns(Promise.resolve(users));
  //
  //    usersController.getAll(req, res);
  //
  //    process.nextTick(function() {
  //      res.send.should.have.been.calledWith(users);
  //      res.status.should.have.been.calledWith(200);
  //      done();
  //    })
  //  });
  //
  //  it('should respond with error message and 404 status if user is missing', function(done) {
  //    var req = {
  //      params: {
  //        id: 3
  //      }
  //    };
  //
  //    var error = new ApiError();
  //
  //    findById
  //      .withArgs(3)
  //      .returns(Promise.reject(error));
  //
  //    usersController.getById(req, res);
  //
  //    process.nextTick(function() {
  //      res.send.should.have.been.calledWith(error.message);
  //      res.status.should.have.been.calledWith(error.status);
  //      done();
  //    })
  //
  //  });
  //
  //});

  describe('POST requests', function() {
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

    it('should respond with new user object and 200 status on success', function(done) {
      req.body = {phoneNumber: '1234567890'};
      var successfulCreateResponse = {
        id: '1',
        phoneNumber: req.body.phoneNumber,
        confirmCode: '',
        confirmCodeExpires: '',
        sponsorCode: ''
      };
      UserStub.returns(Promise.resolve({dataValues: successfulCreateResponse}));

      usersController.post(req, res);

      process.nextTick(function() {
        res.json.should.have.been.calledWith([successfulCreateResponse]);
        res.status.should.have.been.calledWith(200);
        done();
      })
    });

    it('should not fail on a formatted phone number', function(done) {
      req.body = {phoneNumber: '(123) 456-7890'};
      var successfulCreateResponse = {
        id: '1',
        phoneNumber: '1234567890',
        confirmCode: '',
        confirmCodeExpires: '',
        sponsorCode: ''
      };
      UserStub.returns(Promise.resolve({dataValues: successfulCreateResponse}));

      usersController.post(req, res);

      process.nextTick(function() {
        res.json.should.have.been.calledWith([successfulCreateResponse]);
        res.status.should.have.been.calledWith(200);
        done();
      })
    });

    it('should respond with an error and 400 status on if phone number is not formatted correctly', function(done) {
      req.body = {phoneNumber: '12345abcde'};
      var errorResponse = [{
        field: 'phoneNumber',
        message: 'phoneNumber must be a string of 10 digits',
        value: '12345'
      }];

      usersController.post(req, res);

      process.nextTick(function() {
        res.json.should.have.been.calledWith(errorResponse);
        res.status.should.have.been.calledWith(400);
        done();
      })
    });

    it('should respond with an error and 400 status on if phone number is missing', function(done) {
      req.body = {foo: 'bar'};
      var errorResponse = [{
        field: 'phoneNumber',
        message: 'phoneNumber is required',
      }];

      usersController.post(req, res);

      process.nextTick(function() {
        res.json.should.have.been.calledWith(errorResponse);
        res.status.should.have.been.calledWith(400);
        done();
      })
    });

    it('should handle database errors', function(done) {
      req.body = {phoneNumber: '1234567890'};
      var databaseError = new Error('some database error');
      UserStub.returns(Promise.reject(databaseError));

      usersController.post(req, res);

      process.nextTick(function() {
        res.json.should.have.been.calledWith(databaseError);
        res.status.should.have.been.calledWith(400);
        done();
      })
    });
  });

  describe('PUT requests', function() {
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

    it('should respond with the updated user object and 200 status on success', function(done) {
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

      usersController.putOnId(req, res);

      process.nextTick(function() {
        res.json.should.have.been.calledWith([updatedUser]);
        res.status.should.have.been.calledWith(200);
        done();
      })
    });

    it('should respond with an error and 400 status on if phone number is not formatted correctly', function(done) {
      req.body = {phoneNumber: '12345abcde'};
      req.params = {id: 1};
      var error = {
        field: 'phoneNumber',
        message: 'phoneNumber must be a string of 10 digits',
        value: '12345'
      };
      findById.withArgs(1)
        .returns(Promise.resolve(user));

      usersController.putOnId(req, res);

      process.nextTick(function() {
        res.json.should.have.been.calledWith([error]);
        res.status.should.have.been.calledWith(400);
        done();
      })
    });

    it('should respond with an error and 404 status if user does not exist', function(done) {
      req.body = {phoneNumber: '1234567890'};
      req.params = {id: 2};
      var error = {
        message: 'User does not exist',
        id: 2
      };
      findById.withArgs(2)
        .returns(Promise.resolve(null));

      usersController.putOnId(req, res);

      process.nextTick(function() {
        res.json.should.have.been.calledWith([error]);
        res.status.should.have.been.calledWith(404);
        done();
      })
    });

    it('should handle database errors', function(done) {
      req.body = {phoneNumber: '1234567890'};
      req.params = {id: 1};
      var error = new Error('database error');
      findById.withArgs(1)
        .returns(Promise.resolve(user));
      update.withArgs(req.body)
        .returns(Promise.reject(error));

      usersController.putOnId(req, res);

      process.nextTick(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
        done();
      })
    });
  });

  describe('DELETE requests', function() {
    var req, res, usersController, destroy;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      destroy = sinon.stub(User, 'destroy');
      usersController = require('../../controllers/usersController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      destroy.restore();
    });

    it('should respond with the user ID and 200 status on success', function(done) {
      req.params = {id: 1};
      destroy.withArgs({where: {id: 1}})
        .returns(Promise.resolve(1));

      usersController.removeById(req, res);

      process.nextTick(function() {
        res.json.should.have.been.calledWith([{deletedId: 1}]);
        res.status.should.have.been.calledWith(200);
        done();
      })
    });

    it('should respond with an error and 404 status if user does not exist', function(done) {
      req.params = {id: 2};
      var error = {
        message: 'User does not exist',
        id: 2
      };
      destroy.withArgs({where: {id: 2}})
        .returns(Promise.resolve(0));

      usersController.removeById(req, res);

      process.nextTick(function() {
        res.json.should.have.been.calledWith([error]);
        res.status.should.have.been.calledWith(404);
        done();
      })
    });

    it('should handle database errors', function(done) {
      req.params = {id: 1};
      var error = new Error('database error');
      destroy.withArgs({where: {id: 1}})
        .returns(Promise.reject(error));

      usersController.removeById(req, res);

      process.nextTick(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
        done();
      })
    });
  });
});
