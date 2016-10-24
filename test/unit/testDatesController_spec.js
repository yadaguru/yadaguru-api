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
var testDateService = require('../../services/testDateService');
var auth = require('../../services/authService');

describe('Test Dates Controller', function() {
  var req, res, testDatesController, reqGet, getUserData;

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
    testDatesController = require('../../controllers/testDatesController');
  });

  afterEach(function() {
    res.status.reset();
    res.json.reset();
    reqGet.restore();
    getUserData.restore();
  });

  describe('GET /test_dates', function() {
    var findAll;

    beforeEach(function() {
      findAll = sinon.stub(testDateService, 'findAll');
    });

    afterEach(function() {
      findAll.restore();
    });

    it('should respond with an array of all testDates and a 200 status', function() {
      var testDates =[{
        id: 1,
        testId: '1',
        registrationDate: '2016-09-01',
        adminDate: '2016-10-01'
      }, {
        id: 2,
        testId: '2',
        registrationDate: '2017-01-01',
        adminDate: '2017-02-01'
      }];
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      findAll.returns(Promise.resolve(testDates));

      return testDatesController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith(testDates);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond with an empty array and a 200 status if there are no testDates', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      findAll.returns(Promise.resolve([]));

      return testDatesController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith([]);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'user'});

      return testDatesController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer an invalid token');
      getUserData.withArgs('Bearer an invalid token')
        .returns(false);

      return testDatesController.getAll(req, res).then(function() {
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
      findAll.returns(Promise.reject(error));

      return testDatesController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });

    });
  });

  describe('GET /testDates/:id', function() {
    var findById;

    beforeEach(function() {
      findById = sinon.stub(testDateService, 'findById');
    });

    afterEach(function() {
      findById.restore();
    });

    it('should respond with an array with the matching testDate and a 200 status', function() {
      req.params = {id: 1};
      var testDate = {
        id: 1,
        testId: '1',
        registrationDate: '2016-09-01',
        adminDate: '2016-10-01'
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      findById.withArgs(1)
        .returns(Promise.resolve([testDate]));

      return testDatesController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith([testDate]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should an error object and a 404 status if the testDate does not exist', function() {
      req.params = {id: 2};
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      var error = new errors.ResourceNotFoundError('TestDate', req.params.id);
      findById.withArgs(2)
        .returns(Promise.resolve([]));

      return testDatesController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      });

    });

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'user'});

      return testDatesController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer an invalid token');
      getUserData.withArgs('Bearer an invalid token')
        .returns(false);

      return testDatesController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond with an error object and a 500 status on a database error', function() {
      req.params = {id: 1};
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      var error = new Error('database error');
      findById.returns(Promise.reject(error));

      return testDatesController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });

    });
  });

  describe('POST /test_dates', function() {
    var create;

    beforeEach(function() {
      create = sinon.stub(testDateService, 'create');
    });

    afterEach(function() {
      create.restore();
    });

    it('should respond with new testDate object and 200 status on success', function() {
      req.body = {
        testId: '1',
        registrationDate: '2016-09-01',
        adminDate: '2016-10-01'
      };
      var successfulCreateResponse = {
        id: '2',
        testId: req.body.testId,
        registrationDate: req.body.registrationDate,
        adminDate: req.body.adminDate
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      create.returns(Promise.resolve([successfulCreateResponse]));

      return testDatesController.post(req, res).then(function() {
        res.json.should.have.been.calledWith([successfulCreateResponse]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should respond with an error and 400 status on if testId is missing', function() {
      req.body = {
        registrationDate: '2016-09-01',
        adminDate: '2016-10-01'
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      var error = new errors.ValidationError([{
        field: 'testId',
        message: 'is required'
      }]);

      return testDatesController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond with an error and 400 status on if registrationDate is missing', function() {
      req.body = {
        testId: '1',
        adminDate: '2016-10-01'
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      var error = new errors.ValidationError([{
        field: 'registrationDate',
        message: 'is required'
      }]);

      return testDatesController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond with an error and 400 status on if adminDate is missing', function() {
      req.body = {
        testId: '1',
        registrationDate: '2016-09-01'
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      var error = new errors.ValidationError([{
        field: 'adminDate',
        message: 'is required'
      }]);

      return testDatesController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond with an error and 400 status on if testId is not numeric', function() {
      req.body = {
        testId: 'SAT',
        adminDate: '2016-10-01',
        registrationDate: '2016-09-01'
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      var error = new errors.ValidationError([{
        field: 'testId',
        message: 'must be a number',
        value: 'SAT'
      }]);

      return testDatesController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond with an error and 400 status on if registrationDate is not a date', function() {
      req.body = {
        testId: '1',
        adminDate: '2016-10-01',
        registrationDate: 'someday'
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      var error = new errors.ValidationError([{
        field: 'registrationDate',
        message: 'must be a date',
        value: 'someday'
      }]);

      return testDatesController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond with an error and 400 status on if adminDate is not a date', function() {
      req.body = {
        testId: '1',
        adminDate: 'whenever',
        registrationDate: '2016-10-01'
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      var error = new errors.ValidationError([{
        field: 'adminDate',
        message: 'must be a date',
        value: 'whenever'
      }]);

      return testDatesController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'user'});

      return testDatesController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer an invalid token');
      getUserData.withArgs('Bearer an invalid token')
        .returns(false);

      return testDatesController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.body = {
        testId: '1',
        registrationDate: '2016-09-01',
        adminDate: '2016-10-01'
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      var databaseError = new Error('some database error');
      create.returns(Promise.reject(databaseError));

      return testDatesController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(databaseError);
        res.status.should.have.been.calledWith(500);
      });
    });
  });

  describe('PUT /testDates/:id', function() {
    var update;

    beforeEach(function() {
      update = sinon.stub(testDateService, 'update');
    });

    afterEach(function() {
      update.restore();
    });

    it('should respond with the updated testDate object and 200 status on success', function() {
      req.body = {
        testId: '1',
        registrationDate: '2016-09-01',
        adminDate: '2016-10-01'
      };
      req.params = {id: 1};
      var updatedTestDate = {
        id: '1',
        testId: req.body.testId,
        registrationDate: req.body.registrationDate,
        adminDate: req.body.adminDate
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      update.withArgs(req.params.id, req.body)
        .returns(Promise.resolve([updatedTestDate]));

      return testDatesController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith([updatedTestDate]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should respond with the updated testDate object and 200 status on success even if required fields are missing', function() {
      req.body = {
        registrationDate: '2016-09-02'
      };
      req.params = {id: 1};
      var updatedTestDate = {
        id: '1',
        testId: '1',
        registrationDate: req.body.registrationDate,
        adminDate: '2016-09-01'
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      update.withArgs(req.params.id, req.body)
        .returns(Promise.resolve([updatedTestDate]));

      return testDatesController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith([updatedTestDate]);
        res.status.should.have.been.calledWith(200);
      });
    });


    it('should respond with an error and 404 status if testDate does not exist', function() {
      req.body = {
        testId: '1',
        registrationDate: '2016-09-01',
        adminDate: '2016-10-01'
      };
      req.params = {id: 2};
      var error = new errors.ResourceNotFoundError('TestDate', req.params.id);
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      update.withArgs(2)
        .returns(Promise.resolve(false));

      return testDatesController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      })
    });

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'user'});

      return testDatesController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer an invalid token');
      getUserData.withArgs('Bearer an invalid token')
        .returns(false);

      return testDatesController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.body = {
        testId: '1',
        registrationDate: '2016-09-01',
        adminDate: '2016-10-01'
      };
      req.params = {id: 1};
      var error = new Error('database error');
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      update.withArgs(req.params.id, req.body)
        .returns(Promise.reject(error));

      return testDatesController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      })
    });
  });

  describe('DELETE /testDates/:id', function() {
    var destroy;

    beforeEach(function() {
      destroy = sinon.stub(testDateService, 'destroy');
    });

    afterEach(function() {
      destroy.restore();
    });

    it('should respond with the testDate ID and 200 status on success', function() {
      req.params = {id: 1};
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      destroy.withArgs(req.params.id)
        .returns(Promise.resolve(true));

      return testDatesController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith([{deletedId: 1}]);
        res.status.should.have.been.calledWith(200);
      })
    });

    it('should respond with an error and 404 status if testDate does not exist', function() {
      req.params = {id: 2};
      var error = new errors.ResourceNotFoundError('TestDate', req.params.id);
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      destroy.withArgs(req.params.id)
        .returns(Promise.resolve(false));

      return testDatesController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      })
    });

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'user'});

      return testDatesController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer an invalid token');
      getUserData.withArgs('Bearer an invalid token')
        .returns(false);

      return testDatesController.removeById(req, res).then(function() {
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
      destroy.withArgs(req.params.id)
        .returns(Promise.reject(error));

      return testDatesController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      })
    });
  });
});
