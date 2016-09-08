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
var auth = require('../../services/authService');

describe('Categories Controller', function() {
  var req, res, categoriesController, reqGet, getUserData;

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
    categoriesController = require('../../controllers/categoriesController');
  });

  afterEach(function() {
    res.status.reset();
    res.json.reset();
    reqGet.restore();
    getUserData.restore();
  });

  describe('GET /categories', function() {
    var findAll;

    beforeEach(function() {
      findAll = sinon.stub(categoryService, 'findAll');
    });

    afterEach(function() {
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
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});
      findAll.returns(Promise.resolve(categories));

      return categoriesController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith(categories);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond with an empty array and a 200 status if there are no categories', function() {
      findAll.returns(Promise.resolve([]));
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});

      return categoriesController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith([]);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});

      return categoriesController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      reqGet.withArgs('Bearer')
        .returns('an invalid token');
      getUserData.withArgs('an invalid token')
        .returns(false);

      return categoriesController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond with an error object and a 500 status on a database error', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});
      var error = new Error('database error');
      findAll.returns(Promise.reject(error));

      return categoriesController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });

    });
  });

  describe('GET /categories/:id', function() {
    var findById;

    beforeEach(function() {
      findById = sinon.stub(categoryService, 'findById');
    });

    afterEach(function() {
      findById.restore();
    });

    it('should respond with an array containing matching category and a 200 status', function() {
      req.params = {id: 1};
      var category = {
        id: '1',
        name: 'Essay'
      };
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});
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
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});
      findById.withArgs(2)
        .returns(Promise.resolve([]));

      return categoriesController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      });

    });

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});

      return categoriesController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      reqGet.withArgs('Bearer')
        .returns('an invalid token');
      getUserData.withArgs('an invalid token')
        .returns(false);

      return categoriesController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond with an error object and a 500 status on a database error', function() {
      req.params = {id: 1};
      var error = new Error('database error');
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});
      findById.returns(Promise.reject(error));

      return categoriesController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });

    });
  });

  describe('POST /categories', function() {
    var create;

    beforeEach(function() {
      create = sinon.stub(categoryService, 'create');
    });

    afterEach(function() {
      create.restore();
    });

    it('should respond with an array containing the new category object and 200 status on success', function() {
      req.body = {name: 'Essay'};
      var successfulCreateResponse = {
        id: '2',
        name: req.body.name
      };
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});
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
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});

      return categoriesController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      req.body = {name: 'Essay'};
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});

      return categoriesController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      req.body = {name: 'Essay'};
      reqGet.withArgs('Bearer')
        .returns('an invalid token');
      getUserData.withArgs('an invalid token')
        .returns(false);

      return categoriesController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.body = {name: 'Essay'};
      var databaseError = new Error('some database error');
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});
      create.returns(Promise.reject(databaseError));

      return categoriesController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(databaseError);
        res.status.should.have.been.calledWith(500);
      });
    });
  });

  describe('PUT /categories/:id', function() {
    var update;

    beforeEach(function() {
      update = sinon.stub(categoryService, 'update');
    });

    afterEach(function() {
      update.restore();
    });

    it('should respond with an array containing the updated category object and 200 status on success', function() {
      req.body = {name: 'Essay'};
      req.params = {id: 1};
      var updatedCategory = {
        id: '1',
        name: req.body.name
      };
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});
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
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});
      update.withArgs(req.params.id)
        .returns(Promise.resolve(false));

      return categoriesController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      })
    });

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      req.body = {name: 'Essay'};
      req.params = {id: 2};
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});

      return categoriesController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      req.body = {name: 'Essay'};
      req.params = {id: 2};
      reqGet.withArgs('Bearer')
        .returns('an invalid token');
      getUserData.withArgs('an invalid token')
        .returns(false);

      return categoriesController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.body = {name: 'Essay'};
      req.params = {id: 1};
      var error = new Error('database error');
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});
      update.withArgs(req.params.id, req.body)
        .returns(Promise.reject(error));

      return categoriesController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      })
    });
  });

  describe('DELETE /categories/:id', function() {
    var destroy;

    beforeEach(function() {
      destroy = sinon.stub(categoryService, 'destroy');
    });

    afterEach(function() {
      destroy.restore();
    });

    it('should respond with the categoryService ID and 200 status on success', function() {
      req.params = {id: 1};
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});
      destroy.withArgs(req.params.id)
        .returns(Promise.resolve(true));

      return categoriesController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith([{deletedId: 1}]);
        res.status.should.have.been.calledWith(200);
      })
    });

    it('should respond with an error and 404 status if category does not exist', function() {
      req.params = {id: 2};
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});
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
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});
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

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      req.params = {id: 2};
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});

      return categoriesController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      req.params = {id: 2};
      reqGet.withArgs('Bearer')
        .returns('an invalid token');
      getUserData.withArgs('an invalid token')
        .returns(false);

      return categoriesController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.params = {id: 1};
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});
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
