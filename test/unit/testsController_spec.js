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
var testService = require('../../services/testService');

describe('Content Items Controller', function() {
  describe('GET /tests', function() {
    var req, res, testsController, findAll;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      findAll = sinon.stub(testService, 'findAll');
      testsController = require('../../controllers/testsController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      findAll.restore();
    });

    it('should respond with an array of all tests and a 200 status', function() {
      var tests = [{
        id: 1,
        type: 'SAT',
        message: 'A message',
        detail: 'Some details'
      }, {
        id: 2,
        type: 'ACT',
        message: 'A message',
        detail: 'Some details'
      }];
      findAll.returns(Promise.resolve(tests));

      return testsController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith(tests);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond with an empty array and a 200 status if there are no tests', function() {
      findAll.returns(Promise.resolve([]));

      return testsController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith([]);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond with an error object and a 500 status on a database error', function() {
      var error = new Error('database error');
      findAll.returns(Promise.reject(error));

      return testsController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });

    });
  });

  describe('GET /tests/:id', function() {
    var req, res, testsController, findById;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      findById = sinon.stub(testService, 'findById');
      testsController = require('../../controllers/testsController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      findById.restore();
    });

    it('should respond with an array with the matching test and a 200 status', function() {
      req.params = {id: 1};
      var test = {
        id: 1,
        type: 'SAT',
        message: 'A message',
        detail: 'Some details'
      };
      findById.withArgs(1)
        .returns(Promise.resolve([test]));

      return testsController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith([test]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should an error object and a 404 status if the test does not exist', function() {
      req.params = {id: 2};
      var error = new errors.ResourceNotFoundError('Test', req.params.id);
      findById.withArgs(2)
        .returns(Promise.resolve([]));

      return testsController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      });

    });

    it('should respond with an error object and a 500 status on a database error', function() {
      req.params = {id: 1};
      var error = new Error('database error');
      findById.returns(Promise.reject(error));

      return testsController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });

    });
  });

  describe('POST /tests', function() {
    var req, res, testsController, create;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      create = sinon.stub(testService, 'create');
      testsController = require('../../controllers/testsController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      create.restore();
    });

    it('should respond with new test object and 200 status on success', function() {
      req.body = {
        type: 'SAT',
        message: 'A message',
        detail: 'Some details'
      };
      var successfulCreateResponse = {
        id: '2',
        type: req.body.type,
        message: req.body.message,
        detail: req.body.detail
      };
      create.returns(Promise.resolve([successfulCreateResponse]));

      return testsController.post(req, res).then(function() {
        res.json.should.have.been.calledWith([successfulCreateResponse]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should respond with an error and 400 status on if name is missing', function() {
      req.body = {
        message: 'A message',
        detail: 'Some details'
      };
      var error = new errors.ValidationError([{
        field: 'type',
        message: 'is required'
      }]);

      return testsController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond with an error and 400 status on if message is missing', function() {
      req.body = {
        type: 'SAT',
        detail: 'Some details'
      };
      var error = new errors.ValidationError([{
        field: 'message',
        message: 'is required'
      }]);

      return testsController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond with an error and 400 status on if detail is missing', function() {
      req.body = {
        type: 'SAT',
        message: 'A message'
      };
      var error = new errors.ValidationError([{
        field: 'detail',
        message: 'is required'
      }]);

      return testsController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.body = {
        type: 'SAT',
        message: 'A message',
        detail: 'Some details'
      };
      var databaseError = new Error('some database error');
      create.returns(Promise.reject(databaseError));

      return testsController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(databaseError);
        res.status.should.have.been.calledWith(500);
      });
    });
  });

  describe('PUT /tests/:id', function() {
    var req, res, testsController, update;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      update = sinon.stub(testService, 'update');
      testsController = require('../../controllers/testsController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      update.restore();
    });

    it('should respond with the updated test object and 200 status on success', function() {
      req.body = {
        type: 'SAT',
        message: 'A message',
        detail: 'Some details'
      };
      req.params = {id: 1};
      var updatedTest = {
        id: '1',
        type: req.body.type,
        message: req.body.message,
        detail: req.body.detail
      };
      update.withArgs(req.params.id, req.body)
        .returns(Promise.resolve([updatedTest]));

      return testsController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith([updatedTest]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should respond with the updated test object and 200 status on success even if required fields are missing', function() {
      req.body = {
        message: 'A message',
        detail: 'Some details'
      };
      req.params = {id: 1};
      var updatedTest = {
        id: '1',
        type: 'SAT',
        message: req.body.message,
        detail: req.body.detail
      };
      update.withArgs(req.params.id, req.body)
        .returns(Promise.resolve([updatedTest]));

      return testsController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith([updatedTest]);
        res.status.should.have.been.calledWith(200);
      });
    });


    it('should respond with an error and 404 status if test does not exist', function() {
      req.body = {
        type: 'SAT',
        message: 'A message',
        detail: 'Some details'
      };
      req.params = {id: 2};
      var error = new errors.ResourceNotFoundError('Test', req.params.id);
      update.withArgs(2)
        .returns(Promise.resolve(false));

      return testsController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      })
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.body = {
        type: 'SAT',
        message: 'A message',
        detail: 'Some details'
      };
      req.params = {id: 1};
      var error = new Error('database error');
      update.withArgs(req.params.id, req.body)
        .returns(Promise.reject(error));

      return testsController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      })
    });
  });

  describe('DELETE /tests/:id', function() {
    var req, res, testsController, destroy;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      destroy = sinon.stub(testService, 'destroy');
      testsController = require('../../controllers/testsController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      destroy.restore();
    });

    it('should respond with the test ID and 200 status on success', function() {
      req.params = {id: 1};
      destroy.withArgs(req.params.id)
        .returns(Promise.resolve(true));

      return testsController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith([{deletedId: 1}]);
        res.status.should.have.been.calledWith(200);
      })
    });

    it('should respond with an error and 404 status if test does not exist', function() {
      req.params = {id: 2};
      var error = new errors.ResourceNotFoundError('Test', req.params.id);
      destroy.withArgs(req.params.id)
        .returns(Promise.resolve(false));

      return testsController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      })
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.params = {id: 1};
      var error = new Error('database error');
      destroy.withArgs(req.params.id)
        .returns(Promise.reject(error));

      return testsController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      })
    });
  });
});
