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

describe('Test Dates Controller', function() {
  describe('GET /test_dates', function() {
    var req, res, testDatesController, findAll;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      findAll = sinon.stub(testDateService, 'findAll');
      testDatesController = require('../../controllers/testDatesController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
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
      findAll.returns(Promise.resolve(testDates));

      return testDatesController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith(testDates);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond with an empty array and a 200 status if there are no testDates', function() {
      findAll.returns(Promise.resolve([]));

      return testDatesController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith([]);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond with an error object and a 500 status on a database error', function() {
      var error = new Error('database error');
      findAll.returns(Promise.reject(error));

      return testDatesController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });

    });
  });

  describe('GET /testDates/:id', function() {
    var req, res, testDatesController, findById;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      findById = sinon.stub(testDateService, 'findById');
      testDatesController = require('../../controllers/testDatesController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
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
      findById.withArgs(1)
        .returns(Promise.resolve([testDate]));

      return testDatesController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith([testDate]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should an error object and a 404 status if the testDate does not exist', function() {
      req.params = {id: 2};
      var error = new errors.ResourceNotFoundError('TestDate', req.params.id);
      findById.withArgs(2)
        .returns(Promise.resolve([]));

      return testDatesController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      });

    });

    it('should respond with an error object and a 500 status on a database error', function() {
      req.params = {id: 1};
      var error = new Error('database error');
      findById.returns(Promise.reject(error));

      return testDatesController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });

    });
  });

  describe('POST /test_dates', function() {
    var req, res, testDatesController, create;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      create = sinon.stub(testDateService, 'create');
      testDatesController = require('../../controllers/testDatesController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
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

    it('should respond with an error and a 500 status on a database error', function() {
      req.body = {
        testId: '1',
        registrationDate: '2016-09-01',
        adminDate: '2016-10-01'
      };
      var databaseError = new Error('some database error');
      create.returns(Promise.reject(databaseError));

      return testDatesController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(databaseError);
        res.status.should.have.been.calledWith(500);
      });
    });
  });

  describe('PUT /testDates/:id', function() {
    var req, res, testDatesController, update;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      update = sinon.stub(testDateService, 'update');
      testDatesController = require('../../controllers/testDatesController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
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
      update.withArgs(2)
        .returns(Promise.resolve(false));

      return testDatesController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      })
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.body = {
        testId: '1',
        registrationDate: '2016-09-01',
        adminDate: '2016-10-01'
      };
      req.params = {id: 1};
      var error = new Error('database error');
      update.withArgs(req.params.id, req.body)
        .returns(Promise.reject(error));

      return testDatesController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      })
    });
  });

  describe('DELETE /testDates/:id', function() {
    var req, res, testDatesController, destroy;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      destroy = sinon.stub(testDateService, 'destroy');
      testDatesController = require('../../controllers/testDatesController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      destroy.restore();
    });

    it('should respond with the testDate ID and 200 status on success', function() {
      req.params = {id: 1};
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
      destroy.withArgs(req.params.id)
        .returns(Promise.resolve(false));

      return testDatesController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      })
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.params = {id: 1};
      var error = new Error('database error');
      destroy.withArgs(req.params.id)
        .returns(Promise.reject(error));

      return testDatesController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      })
    });
  });
});
