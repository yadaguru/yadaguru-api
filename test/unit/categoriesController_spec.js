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
var categoryService = require('../../services/categoryService');

describe('Categories Controller', function() {
  describe('GET /categories', function() {
    var req, res, categoriesController, findAll;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      findAll = sinon.stub(categoryService, 'findAll');
      categoriesController = require('../../controllers/categoriesController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      findAll.restore();
    });

    it('should respond with an array of all categories and a 200 status', function() {
      var categories = [{
        id: '1',
        name: 'Essay'
      }, {
        id: '2',
        name: 'Recommendation Letter'
      }];
      findAll.returns(Promise.resolve(categories));

      return categoriesController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith(categories);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond with an empty array and a 200 status if there are no categories', function() {
      findAll.returns(Promise.resolve([]));

      return categoriesController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith([]);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond with an error object and a 500 status on a database error', function() {
      var error = new Error('database error');
      findAll.returns(Promise.reject(error));

      return categoriesController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });

    });
  });

  describe('GET /categories/:id', function() {
    var req, res, categoriesController, findById;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      findById = sinon.stub(categoryService, 'findById');
      categoriesController = require('../../controllers/categoriesController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      findById.restore();
    });

    it('should respond with an array containing matching category and a 200 status', function() {
      req.params = {id: 1};
      var category = {
        id: '1',
        name: 'Essay'
      };
      findById.withArgs(1)
        .returns(Promise.resolve([category]));

      return categoriesController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith([category]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should an error object and a 404 status if the category does not exist', function() {
      req.params = {id: 2};
      var error = new errors.ResourceNotFoundError('Category', req.params.id);
      findById.withArgs(2)
        .returns(Promise.resolve([]));

      return categoriesController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      });

    });

    it('should respond with an error object and a 500 status on a database error', function() {
      req.params = {id: 1};
      var error = new Error('database error');
      findById.returns(Promise.reject(error));

      return categoriesController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });

    });
  });

  describe('POST /categories', function() {
    var req, res, categoriesController, create;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      create = sinon.stub(categoryService, 'create');
      categoriesController = require('../../controllers/categoriesController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      create.restore();
    });

    it('should respond with an array containing the new category object and 200 status on success', function() {
      req.body = {name: 'Essay'};
      var successfulCreateResponse = {
        id: '2',
        name: req.body.name
      };
      create.returns(Promise.resolve([successfulCreateResponse]));

      return categoriesController.post(req, res).then(function() {
        res.json.should.have.been.calledWith([successfulCreateResponse]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should respond with an error and 400 status on if name is missing', function() {
      req.body = {foo: 'bar'};
      var error = new errors.ValidationError([{
        field: 'name',
        message: 'is required'
      }]);

      return categoriesController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.body = {name: 'Essay'};
      var databaseError = new Error('some database error');
      create.returns(Promise.reject(databaseError));

      return categoriesController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(databaseError);
        res.status.should.have.been.calledWith(500);
      });
    });
  });

  describe('PUT /categories/:id', function() {
    var req, res, categoriesController, update;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      update = sinon.stub(categoryService, 'update');
      categoriesController = require('../../controllers/categoriesController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      update.restore();
    });

    it('should respond with an array containing the updated category object and 200 status on success', function() {
      req.body = {name: 'Essay'};
      req.params = {id: 1};
      var updatedCategory = {
        id: '1',
        name: req.body.name
      };
      update.withArgs(req.params.id, req.body)
        .returns(Promise.resolve([updatedCategory]));

      return categoriesController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith([updatedCategory]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should respond with an error and 404 status if category does not exist', function() {
      req.body = {name: 'Essay'};
      req.params = {id: 2};
      var error = new errors.ResourceNotFoundError('Category', req.params.id);
      update.withArgs(req.params.id)
        .returns(Promise.resolve(false));

      return categoriesController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      })
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.body = {name: 'Essay'};
      req.params = {id: 1};
      var error = new Error('database error');
      update.withArgs(req.params.id, req.body)
        .returns(Promise.reject(error));

      return categoriesController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      })
    });
  });

  describe('DELETE /categories/:id', function() {
    var req, res, categoriesController, destroy;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      destroy = sinon.stub(categoryService, 'destroy');
      categoriesController = require('../../controllers/categoriesController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      destroy.restore();
    });

    it('should respond with the categoryService ID and 200 status on success', function() {
      req.params = {id: 1};
      destroy.withArgs(req.params.id)
        .returns(Promise.resolve(true));

      return categoriesController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith([{deletedId: 1}]);
        res.status.should.have.been.calledWith(200);
      })
    });

    it('should respond with an error and 404 status if category does not exist', function() {
      req.params = {id: 2};
      var error = new errors.ResourceNotFoundError('Category', req.params.id);
      destroy.withArgs(req.params.id)
        .returns(Promise.resolve(false));

      return categoriesController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      })
    });

    it('should respond with an error and 409 status if there is a foreign constraint error', function() {
      req.params = {id: 2};
      var dbError = new Error();
      dbError.name = 'SequelizeForeignKeyConstraintError';
      var error = new errors.ForeignConstraintError('Category');

      destroy.withArgs(req.params.id)
        .returns(Promise.reject(dbError));

      return categoriesController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(409);
      })
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.params = {id: 1};
      var error = new Error('database error');
      destroy.withArgs(req.params.id)
        .returns(Promise.reject(error));

      return categoriesController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      })
    });
  });
});
