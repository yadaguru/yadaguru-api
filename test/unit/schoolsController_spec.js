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
var auth = require('../../services/authService');

describe('Schools Controller', function() {
  var req, res, schoolsController, reqGet, getUserData;

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
    schoolsController = require('../../controllers/schoolsController');
  });

  afterEach(function() {
    res.status.reset();
    res.json.reset();
    reqGet.restore();
    getUserData.restore();
  });

  describe('GET /schools', function() {
    var findByUser;

    beforeEach(function() {
      findByUser = sinon.stub(schoolService, 'findByUser');
    });

    afterEach(function() {
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

      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});

      findByUser.returns(Promise.resolve(schools));

      return schoolsController.getAllForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(schools);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond with an empty array and a 200 status if there are no schools', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});

      findByUser.returns(Promise.resolve([]));

      return schoolsController.getAllForUser(req, res).then(function() {
        res.json.should.have.been.calledWith([]);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});

      return schoolsController.getAllForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      reqGet.withArgs('Bearer')
        .returns('an invalid token');
      getUserData.withArgs('an invalid token')
        .returns(false);

      return schoolsController.getAllForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond with an error object and a 500 status on a database error', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});

      var error = new Error('database error');
      findByUser.returns(Promise.reject(error));

      return schoolsController.getAllForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });

    });
  });

  describe('GET /schools/:id', function() {
    var findByIdForUser;

    beforeEach(function() {
      findByIdForUser = sinon.stub(schoolService, 'findByIdForUser');
    });

    afterEach(function() {
      findByIdForUser.restore();
    });

    it('should respond with an array with the matching school and a 200 status', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});

      req.params = {id: 1};
      var school = {
        id: '1',
        name: 'Temple',
        dueDate: '2017-02-01',
        isActive: 'true'
      };
      findByIdForUser.withArgs(1, 1)
        .returns(Promise.resolve([school]));

      return schoolsController.getByIdForUser(req, res).then(function() {
        res.json.should.have.been.calledWith([school]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should an error object and a 404 status if the school does not exist', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});

      req.params = {id: 2};
      var error = new errors.ResourceNotFoundError('School', req.params.id);
      findByIdForUser.withArgs(2, 1)
        .returns(Promise.resolve([]));

      return schoolsController.getByIdForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      });

    });

    it('should respond with an error object and a 500 status on a database error', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});

      req.params = {id: 1};
      var error = new Error('database error');
      findByIdForUser.returns(Promise.reject(error));

      return schoolsController.getByIdForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });
    });

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});

      return schoolsController.getByIdForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      reqGet.withArgs('Bearer')
        .returns('an invalid token');
      getUserData.withArgs('an invalid token')
        .returns(false);

      return schoolsController.getByIdForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });
  });

  describe('POST /schools', function() {
    var create;

    beforeEach(function() {
      create = sinon.stub(schoolService, 'create');
    });

    afterEach(function() {
      create.restore();
    });

    it('should respond with new school object and 200 status on success', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});

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
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});

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
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});

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
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});

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
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});

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
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});

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

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});

      return schoolsController.postForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      reqGet.withArgs('Bearer')
        .returns('an invalid token');
      getUserData.withArgs('an invalid token')
        .returns(false);

      return schoolsController.postForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });
  });

  describe('PUT /schools/:id', function() {
    var updateForUser;

    beforeEach(function() {
      updateForUser = sinon.stub(schoolService, 'updateForUser');
    });

    afterEach(function() {
      updateForUser.restore();
    });

    it('should respond with the updated school object and 200 status on success', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});

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
      updateForUser.withArgs(req.params.id, req.body, 1)
        .returns(Promise.resolve([updatedSchool]));

      return schoolsController.putOnIdForUser(req, res).then(function() {
        res.json.should.have.been.calledWith([updatedSchool]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should respond with the updated school object and 200 status on success when required fields are missing', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});

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
      updateForUser.withArgs(req.params.id, req.body, 1)
        .returns(Promise.resolve([updatedSchool]));

      return schoolsController.putOnIdForUser(req, res).then(function() {
        res.json.should.have.been.calledWith([updatedSchool]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should respond with an error and 404 status if school does not exist', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});

      req.body = {
        name: 'Drexel',
        dueDate: '2017-02-17',
        isActive: 'false'
      };
      req.params = {id: 2};
      var error = new errors.ResourceNotFoundError('School', req.params.id);
      updateForUser.withArgs(req.params.id, req.body, 1)
        .returns(Promise.resolve(false));

      return schoolsController.putOnIdForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      })
    });

    it('should respond with an error and a 500 status on a database error', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});

      req.body = {
        name: 'Drexel',
        dueDate: '2017-02-17',
        isActive: 'false'
      };
      req.params = {id: 1};
      var error = new Error('database error');
      updateForUser.withArgs(req.params.id, req.body, 1)
        .returns(Promise.reject(error));

      return schoolsController.putOnIdForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      })
    });

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});

      return schoolsController.putOnIdForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      reqGet.withArgs('Bearer')
        .returns('an invalid token');
      getUserData.withArgs('an invalid token')
        .returns(false);

      return schoolsController.putOnIdForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });
  });

  describe('DELETE /schools/:id', function() {
    var destroyForUser;

    beforeEach(function() {
      destroyForUser = sinon.stub(schoolService, 'destroyForUser');
    });

    afterEach(function() {
      destroyForUser.restore();
    });

    it('should respond with the school ID and 200 status on success', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});

      req.params = {id: 1};
      destroyForUser.withArgs(req.params.id, 1)
        .returns(Promise.resolve(true));

      return schoolsController.removeByIdForUser(req, res).then(function() {
        res.json.should.have.been.calledWith([{deletedId: 1}]);
        res.status.should.have.been.calledWith(200);
      })
    });

    it('should respond with an error and 404 status if school does not exist', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});

      req.params = {id: 2};
      var error = new errors.ResourceNotFoundError('School', req.params.id);
      destroyForUser.withArgs(req.params.id, 1)
        .returns(Promise.resolve(false));

      return schoolsController.removeByIdForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      })
    });

    it('should respond with an error and a 500 status on a database error', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});

      req.params = {id: 1};
      var error = new Error('database error');
      destroyForUser.withArgs(req.params.id, 1)
        .returns(Promise.reject(error));

      return schoolsController.removeByIdForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      })
    });

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});

      req.params = {id: 1};
      return schoolsController.removeByIdForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      reqGet.withArgs('Bearer')
        .returns('an invalid token');
      getUserData.withArgs('an invalid token')
        .returns(false);

      req.params = {id: 1};
      return schoolsController.removeByIdForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });
  });
});
