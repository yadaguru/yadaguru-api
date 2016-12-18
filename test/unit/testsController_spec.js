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

describe('Tests Controller', function() {
  var req, res, testsController, reqGet, getUserData, yadaguruDataMock;

  beforeEach(function() {
    yadaguruDataMock = mocks.getYadaguruDataMock('testService');
    yadaguruDataMock.stubMethods();
    req = {
      get: function(){}
    };
    res = {
      status: sinon.spy(),
      json: sinon.spy()
    };
    reqGet = sinon.stub(req, 'get');
    getUserData = sinon.stub(auth, 'getUserData');
    testsController = proxyquire('../../controllers/testsController', {
      'yadaguru-data': yadaguruDataMock.getMockObject()
    });
  });

  afterEach(function() {
    res.status.reset();
    res.json.reset();
    reqGet.restore();
    getUserData.restore();
    yadaguruDataMock.restoreStubs();
  });

  describe('GET /tests', function() {
    it('should respond with an array of all tests and a 200 status', function() {
      var tests = [{
        id: 1,
        type: 'SAT',
        registrationMessage: 'A message',
        registrationDetail: 'Some details',
        adminMessage: 'A message about the test',
        adminDetail: 'Some details'
      }, {
        id: 2,
        type: 'ACT',
        registrationMessage: 'A message',
        registrationDetail: 'Some details',
        adminMessage: 'A message about the test',
        adminDetail: 'Some details'
      }];
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      yadaguruDataMock.services.testService.stubs.findAll.returns(Promise.resolve(tests));

      return testsController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith(tests);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond with an empty array and a 200 status if there are no tests', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      yadaguruDataMock.services.testService.stubs.findAll.returns(Promise.resolve([]));

      return testsController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith([]);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'user'});

      return testsController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer an invalid token');
      getUserData.withArgs('Bearer an invalid token')
        .returns(false);

      return testsController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond with an error object and a 500 status on a database error', function() {
      var error = new Error('database error');
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      yadaguruDataMock.services.testService.stubs.findAll.returns(Promise.reject(error));

      return testsController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });

    });
  });

  describe('GET /tests/:id', function() {
    it('should respond with an array with the matching test and a 200 status', function() {
      req.params = {id: 1};
      var test = {
        id: 1,
        type: 'SAT',
        registrationMessage: 'A message',
        registrationDetail: 'Some details',
        adminMessage: 'A message about the test',
        adminDetail: 'Some details'
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      yadaguruDataMock.services.testService.stubs.findById.withArgs(1)
        .returns(Promise.resolve([test]));

      return testsController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith([test]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should an error object and a 404 status if the test does not exist', function() {
      req.params = {id: 2};
      var error = new errors.ResourceNotFoundError('Test', req.params.id);
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      yadaguruDataMock.services.testService.stubs.findById.withArgs(2)
        .returns(Promise.resolve([]));

      return testsController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      });

    });

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'user'});

      return testsController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer an invalid token');
      getUserData.withArgs('Bearer an invalid token')
        .returns(false);

      return testsController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond with an error object and a 500 status on a database error', function() {
      req.params = {id: 1};
      var error = new Error('database error');
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      yadaguruDataMock.services.testService.stubs.findById.returns(Promise.reject(error));

      return testsController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });

    });
  });

  describe('POST /tests', function() {
    it('should respond with new test object and 200 status on success', function() {
      req.body = {
        type: 'SAT',
        registrationMessage: 'A message',
        registrationDetail: 'Some details',
        adminMessage: 'A message about the test',
        adminDetail: 'Some details'
      };
      var successfulCreateResponse = {
        id: '2',
        type: req.body.type,
        registrationMessage: req.body.registrationMessage,
        registrationDetail: req.body.registrationDetail,
        adminMessage: req.body.adminMessage,
        adminDetail: req.body.adminDetail
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      yadaguruDataMock.services.testService.stubs.create.returns(Promise.resolve([successfulCreateResponse]));

      return testsController.post(req, res).then(function() {
        res.json.should.have.been.calledWith([successfulCreateResponse]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should respond with an error and 400 status on if type is missing', function() {
      req.body = {
        registrationMessage: 'A message',
        registrationDetail: 'Some details',
        adminMessage: 'A message about the test',
        adminDetail: 'Some details'
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      var error = new errors.ValidationError([{
        field: 'type',
        message: 'is required'
      }]);

      return testsController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond with an error and 400 status on if registrationMessage is missing', function() {
      req.body = {
        type: 'SAT',
        registrationDetail: 'Some details',
        adminMessage: 'A message about the test',
        adminDetail: 'Some details'
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      var error = new errors.ValidationError([{
        field: 'registrationMessage',
        message: 'is required'
      }]);

      return testsController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond with an error and 400 status on if registrationDetail is missing', function() {
      req.body = {
        type: 'SAT',
        registrationMessage: 'A message',
        adminMessage: 'A message about the test',
        adminDetail: 'Some details'
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      var error = new errors.ValidationError([{
        field: 'registrationDetail',
        message: 'is required'
      }]);

      return testsController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond with an error and 400 status on if adminMessage is missing', function() {
      req.body = {
        type: 'SAT',
        registrationMessage: 'A message',
        registrationDetail: 'Some details',
        adminDetail: 'Some details'
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      var error = new errors.ValidationError([{
        field: 'adminMessage',
        message: 'is required'
      }]);

      return testsController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond with an error and 400 status on if adminDetail is missing', function() {
      req.body = {
        type: 'SAT',
        registrationMessage: 'A message',
        registrationDetail: 'Some details',
        adminMessage: 'A message about the test',
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      var error = new errors.ValidationError([{
        field: 'adminDetail',
        message: 'is required'
      }]);

      return testsController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'user'});

      return testsController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer an invalid token');
      getUserData.withArgs('Bearer an invalid token')
        .returns(false);

      return testsController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.body = {
        type: 'SAT',
        registrationMessage: 'A message',
        registrationDetail: 'Some details',
        adminMessage: 'A message about the test',
        adminDetail: 'Some details'
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      var databaseError = new Error('some database error');
      yadaguruDataMock.services.testService.stubs.create.returns(Promise.reject(databaseError));

      return testsController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(databaseError);
        res.status.should.have.been.calledWith(500);
      });
    });
  });

  describe('PUT /tests/:id', function() {
    it('should respond with the updated test object and 200 status on success', function() {
      req.body = {
        type: 'SAT',
        registrationMessage: 'A message',
        registrationDetail: 'Some details',
        adminMessage: 'A message about the test',
        adminDetail: 'Some details'
      };
      req.params = {id: 1};
      var updatedTest = {
        id: '1',
        type: req.body.type,
        registrationMessage: req.body.registrationMessage,
        registrationDetail: req.body.registrationDetail,
        adminMessage: req.body.adminMessage,
        adminDetail: req.body.adminDetail
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      yadaguruDataMock.services.testService.stubs.update.withArgs(req.params.id, req.body)
        .returns(Promise.resolve([updatedTest]));

      return testsController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith([updatedTest]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should respond with the updated test object and 200 status on success even if required fields are missing', function() {
      req.body = {
        registrationMessage: 'A message',
        registrationDetail: 'Some details'
      };
      req.params = {id: 1};
      var updatedTest = {
        id: '1',
        type: 'SAT',
        registrationMessage: req.body.registrationMessage,
        registrationDetail: req.body.registrationDetail
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      yadaguruDataMock.services.testService.stubs.update.withArgs(req.params.id, req.body)
        .returns(Promise.resolve([updatedTest]));

      return testsController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith([updatedTest]);
        res.status.should.have.been.calledWith(200);
      });
    });


    it('should respond with an error and 404 status if test does not exist', function() {
      req.body = {
        type: 'SAT',
        registrationMessage: 'A message',
        registrationDetail: 'Some details'
      };
      req.params = {id: 2};
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      var error = new errors.ResourceNotFoundError('Test', req.params.id);
      yadaguruDataMock.services.testService.stubs.update.withArgs(2)
        .returns(Promise.resolve(false));

      return testsController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      })
    });

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'user'});

      return testsController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer an invalid token');
      getUserData.withArgs('Bearer an invalid token')
        .returns(false);

      return testsController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.body = {
        type: 'SAT',
        registrationMessage: 'A message',
        registrationDetail: 'Some details'
      };
      req.params = {id: 1};
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      var error = new Error('database error');
      yadaguruDataMock.services.testService.stubs.update.withArgs(req.params.id, req.body)
        .returns(Promise.reject(error));

      return testsController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      })
    });
  });

  describe('DELETE /tests/:id', function() {
    it('should respond with the test ID and 200 status on success', function() {
      req.params = {id: 1};
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      yadaguruDataMock.services.testService.stubs.destroy.withArgs(req.params.id)
        .returns(Promise.resolve(true));

      return testsController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith([{deletedId: 1}]);
        res.status.should.have.been.calledWith(200);
      })
    });

    it('should respond with an error and 404 status if test does not exist', function() {
      req.params = {id: 2};
      var error = new errors.ResourceNotFoundError('Test', req.params.id);
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      yadaguruDataMock.services.testService.stubs.destroy.withArgs(req.params.id)
        .returns(Promise.resolve(false));

      return testsController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      })
    });

    it('should respond with an error and 409 status if there is a foreign constraint error', function() {
      req.params = {id: 2};
      var dbError = new Error();
      dbError.name = 'SequelizeForeignKeyConstraintError';
      var error = new errors.ForeignConstraintError('Test');

      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      yadaguruDataMock.services.testService.stubs.destroy.withArgs(req.params.id)
        .returns(Promise.reject(dbError));

      return testsController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(409);
      })
    });

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'user'});

      return testsController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer an invalid token');
      getUserData.withArgs('Bearer an invalid token')
        .returns(false);

      return testsController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.params = {id: 1};
      var error = new Error('database error');
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      yadaguruDataMock.services.testService.stubs.destroy.withArgs(req.params.id)
        .returns(Promise.reject(error));

      return testsController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      })
    });
  });
});
