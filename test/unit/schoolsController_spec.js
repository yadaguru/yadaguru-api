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
var schoolService = require('../../services/schoolService');

describe('Schools Controller', function() {
  describe('GET /schools', function() {
    var req, res, schoolsController, findByUser;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      findByUser = sinon.stub(schoolService, 'findByUser');
      schoolsController = require('../../controllers/schoolsController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      findByUser.restore();
    });

    it('should respond with an array of all schools and a 200 status', function() {
      var schools = [{
        id: '1',
        userId: '1',
        name: 'Temple',
        dueDate: '2017-02-01',
        isActive: true
      }, {
        id: '2',
        userId: '1',
        name: 'Drexel',
        dueDate: '2017-02-01',
        isActive: true
      }];
      findByUser.returns(Promise.resolve(schools));

      return schoolsController.getAllForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(schools);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond with an empty array and a 200 status if there are no schools', function() {
      findByUser.returns(Promise.resolve([]));

      return schoolsController.getAllForUser(req, res).then(function() {
        res.json.should.have.been.calledWith([]);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond with an error object and a 500 status on a database error', function() {
      var error = new Error('database error');
      findByUser.returns(Promise.reject(error));

      return schoolsController.getAllForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });

    });
  });

  describe('GET /schools/:id', function() {
    var req, res, schoolsController, findById;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      findById = sinon.stub(schoolService, 'findById');
      schoolsController = require('../../controllers/schoolsController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      findById.restore();
    });

    it('should respond with an array with the matching school and a 200 status', function() {
      req.params = {id: 1};
      var school = {
        id: '1',
        name: 'Temple',
        dueDate: '2017-02-01',
        isActive: 'true'
      };
      findById.withArgs(1)
        .returns(Promise.resolve([school]));

      return schoolsController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith([school]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should an error object and a 404 status if the school does not exist', function() {
      req.params = {id: 2};
      var error = new errors.ResourceNotFoundError('School', req.params.id);
      findById.withArgs(2)
        .returns(Promise.resolve([]));

      return schoolsController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      });

    });

    it('should respond with an error object and a 500 status on a database error', function() {
      req.params = {id: 1};
      var error = new Error('database error');
      findById.returns(Promise.reject(error));

      return schoolsController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });

    });
  });

  describe('POST /schools', function() {
    var req, res, schoolsController, create;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      create = sinon.stub(schoolService, 'create');
      schoolsController = require('../../controllers/schoolsController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      create.restore();
    });

    it('should respond with new school object and 200 status on success', function() {
      req.body =  {
        name: 'Temple',
        dueDate: '2017-02-01',
        isActive: 'true'
      };
      var successfulCreateResponse = {
        id: '1',
        userId: '1',
        name: req.body.name,
        dueDate: req.body.dueDate,
        isActive: req.body.isActive
      };
      create.returns(Promise.resolve([successfulCreateResponse]));

      return schoolsController.postForUser(req, res).then(function() {
        res.json.should.have.been.calledWith([successfulCreateResponse]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should respond with an error and 400 status on if name is missing', function() {
      req.body =  {
        dueDate: '2017-02-01',
        isActive: 'true'
      };
      var error = new errors.ValidationError([{
        field: 'name',
        message: 'is required'
      }]);

      return schoolsController.postForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond with an error and 400 status on if dueDate is missing', function() {
      req.body =  {
        name: 'Temple',
        isActive: 'true'
      };
      var error = new errors.ValidationError([{
        field: 'dueDate',
        message: 'is required'
      }]);

      return schoolsController.postForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond with an error and 400 status on if dueDate is not a date', function() {
      req.body =  {
        name: 'Temple',
        dueDate: 'not a date',
        isActive: 'true'
      };
      var error = new errors.ValidationError([{
        field: 'dueDate',
        message: 'must be a date',
        value: 'not a date'
      }]);

      return schoolsController.postForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond with an error and 400 status on if isActive is not boolean', function() {
      req.body =  {
        name: 'Temple',
        dueDate: '2017-02-01',
        isActive: 'yes'
      };
      var error = new errors.ValidationError([{
        field: 'isActive',
        message: 'must be true or false',
        value: 'yes'
      }]);

      return schoolsController.postForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.body =  {
        name: 'Temple',
        dueDate: '2017-02-01',
        isActive: 'true'
      };
      var databaseError = new Error('some database error');
      create.returns(Promise.reject(databaseError));

      return schoolsController.postForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(databaseError);
        res.status.should.have.been.calledWith(500);
      });
    });
  });

  describe('PUT /schools/:id', function() {
    var req, res, schoolsController, update;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      update = sinon.stub(schoolService, 'update');
      schoolsController = require('../../controllers/schoolsController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      update.restore();
    });

    it('should respond with the updated school object and 200 status on success', function() {
      req.body = {
        name: 'Drexel',
        dueDate: '2017-02-17',
        isActive: 'false'
      };
      req.params = {id: 1};
      var updatedSchool = {
        id: req.params.id,
        userId: 1,
        name: req.body.name,
        dueDate: req.body.dueDate,
        isActive: req.body.isActive
      };
      update.withArgs(req.params.id, req.body)
        .returns(Promise.resolve([updatedSchool]));

      return schoolsController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith([updatedSchool]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should respond with the updated school object and 200 status on success when required fields are missing', function() {
      req.body = {
        isActive: 'false'
      };
      req.params = {id: 1};
      var updatedSchool = {
        id: req.params.id,
        userId: 1,
        name: 'Temple',
        dueDate: '2017-02-01',
        isActive: req.body.isActive
      };
      update.withArgs(req.params.id, req.body)
        .returns(Promise.resolve([updatedSchool]));

      return schoolsController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith([updatedSchool]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should respond with an error and 404 status if school does not exist', function() {
      req.body = {
        name: 'Drexel',
        dueDate: '2017-02-17',
        isActive: 'false'
      };
      req.params = {id: 2};
      var error = new errors.ResourceNotFoundError('School', req.params.id);
      update.withArgs(req.params.id)
        .returns(Promise.resolve(false));

      return schoolsController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      })
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.body = {
        name: 'Drexel',
        dueDate: '2017-02-17',
        isActive: 'false'
      };
      req.params = {id: 1};
      var error = new Error('database error');
      update.withArgs(req.params.id, req.body)
        .returns(Promise.reject(error));

      return schoolsController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      })
    });
  });

  describe('DELETE /schools/:id', function() {
    var req, res, schoolsController, destroy;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      destroy = sinon.stub(schoolService, 'destroy');
      schoolsController = require('../../controllers/schoolsController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      destroy.restore();
    });

    it('should respond with the school ID and 200 status on success', function() {
      req.params = {id: 1};
      destroy.withArgs(req.params.id)
        .returns(Promise.resolve(true));

      return schoolsController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith([{deletedId: 1}]);
        res.status.should.have.been.calledWith(200);
      })
    });

    it('should respond with an error and 404 status if school does not exist', function() {
      req.params = {id: 2};
      var error = new errors.ResourceNotFoundError('School', req.params.id);
      destroy.withArgs(req.params.id)
        .returns(Promise.resolve(false));

      return schoolsController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      })
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.params = {id: 1};
      var error = new Error('database error');
      destroy.withArgs(req.params.id)
        .returns(Promise.reject(error));

      return schoolsController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      })
    });
  });
});
