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
var timeframeService = require('../../services/timeframeService');
var auth = require('../../services/authService');

describe('Timeframes Controller', function() {
  var req, res, timeframesController, reqGet, getUserData;

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
    timeframesController = require('../../controllers/timeframesController');
  });

  afterEach(function() {
    res.status.reset();
    res.json.reset();
    reqGet.restore();
    getUserData.restore();
  });

  describe('GET /timeframes', function() {
    var  findAll;

    beforeEach(function() {
      findAll = sinon.stub(timeframeService, 'findAll');
    });

    afterEach(function() {
      findAll.restore();
    });

    it('should respond with an array of all timeframes and a 200 status', function() {
      var timeframes = [{
        id: 1,
        name: 'Today',
        type: 'now',
        formula: undefined
      }, {
        id: 2,
        name: 'In 30 Days',
        type: 'relative',
        formula: '30'
      }, {
        id: 3,
        name: 'January 1',
        type: 'absolute',
        formula: '2017-01-01'
      }];
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});
      findAll.returns(Promise.resolve(timeframes));

      return timeframesController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith(timeframes);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond with an empty array and a 200 status if there are no timeframes', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});
      findAll.returns(Promise.resolve([]));

      return timeframesController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith([]);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});

      return timeframesController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      reqGet.withArgs('Bearer')
        .returns('an invalid token');
      getUserData.withArgs('an invalid token')
        .returns(false);

      return timeframesController.getAll(req, res).then(function() {
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

      return timeframesController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });

    });
  });

  describe('GET /timeframes/:id', function() {
    var findById;

    beforeEach(function() {
      findById = sinon.stub(timeframeService, 'findById');
    });

    afterEach(function() {
      findById.restore();
    });

    it('should respond with an array with the matching timeframe and a 200 status', function() {
      req.params = {id: 1};
      var timeframe = {
        id: 1,
        name: 'Today',
        type: 'now',
        formula: undefined
      };
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});
      findById.withArgs(1)
        .returns(Promise.resolve([timeframe]));

      return timeframesController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith([timeframe]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should an error object and a 404 status if the timeframe does not exist', function() {
      req.params = {id: 2};
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});
      var error = new errors.ResourceNotFoundError('Timeframe', req.params.id);
      findById.withArgs(2)
        .returns(Promise.resolve([]));

      return timeframesController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      });
    });

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});

      return timeframesController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      reqGet.withArgs('Bearer')
        .returns('an invalid token');
      getUserData.withArgs('an invalid token')
        .returns(false);

      return timeframesController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond with an error object and a 500 status on a database error', function() {
      req.params = {id: 1};
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});
      var error = new Error('database error');
      findById.returns(Promise.reject(error));

      return timeframesController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });

    });
  });

  describe('POST /timeframes', function() {
    var create;

    beforeEach(function() {
      create = sinon.stub(timeframeService, 'create');
    });

    afterEach(function() {
      create.restore();
    });

    it('should respond with new timeframe object and 200 status on success', function() {
      req.body = {
        name: 'In 30 Days',
        type: 'relative',
        formula: '30'
      };
      var successfulCreateResponse = {
        id: '2',
        name: req.body.name,
        content: req.body.content
      };
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});
      create.returns(Promise.resolve([successfulCreateResponse]));

      return timeframesController.post(req, res).then(function() {
        res.json.should.have.been.calledWith([successfulCreateResponse]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should respond with an error and 400 status on if name is missing', function() {
      req.body = {
        type: 'relative',
        formula: '30'
      };
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});
      var error = new errors.ValidationError([{
        field: 'name',
        message: 'is required'
      }]);

      return timeframesController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond with an error and 400 status on if type is missing', function() {
      req.body = {
        name: 'In 30 Days',
        formula: '30'
      };
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});
      var error = new errors.ValidationError([{
        field: 'type',
        message: 'is required'
      }]);

      return timeframesController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond with an error and 400 status on if formula is not a number when type is relative', function() {
      req.body = {
        name: 'In 30 Days',
        type: 'relative',
        formula: 'not a number'
      };
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});
      var error = new errors.ValidationError([{
        field: 'formula',
        message: 'must be a valid date if type is "absolute", or must be a number if type is "relative"',
        value: 'not a number'
      }]);

      return timeframesController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond with an error and 400 status on if formula is not a valid date when type is absolute', function() {
      req.body = {
        name: 'In 30 Days',
        type: 'absolute',
        formula: 'not a date'
      };
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});
      var error = new errors.ValidationError([{
        field: 'formula',
        message: 'must be a valid date if type is "absolute", or must be a number if type is "relative"',
        value: 'not a date'
      }]);

      return timeframesController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});

      return timeframesController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      reqGet.withArgs('Bearer')
        .returns('an invalid token');
      getUserData.withArgs('an invalid token')
        .returns(false);

      return timeframesController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.body = {
        name: 'In 30 Days',
        type: 'relative',
        formula: '30'
      };
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});
      var databaseError = new Error('some database error');
      create.returns(Promise.reject(databaseError));

      return timeframesController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(databaseError);
        res.status.should.have.been.calledWith(500);
      });
    });
  });

  describe('PUT /timeframes/:id', function() {
    var update;

    beforeEach(function() {
      update = sinon.stub(timeframeService, 'update');
    });

    afterEach(function() {
      update.restore();
    });

    it('should respond with the updated timeframe object and 200 status on success', function() {
      req.body = {
        name: 'In 30 Days',
        type: 'relative',
        formula: '30'
      };
      req.params = {id: 1};
      var updatedTimeframe = {
        id: '1',
        name: req.body.name,
        type: req.body.type,
        formula: req.body.formula
      };
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});
      update.withArgs(req.params.id, req.body)
        .returns(Promise.resolve([updatedTimeframe]));

      return timeframesController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith([updatedTimeframe]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should respond with an error and 404 status if timeframe does not exist', function() {
      req.body = {
        name: 'In 30 Days',
        type: 'relative',
        formula: '30'
      };
      req.params = {id: 2};
      var error = new errors.ResourceNotFoundError('Timeframe', req.params.id);
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});
      update.withArgs(2)
        .returns(Promise.resolve(false));

      return timeframesController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      })
    });

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});

      return timeframesController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      reqGet.withArgs('Bearer')
        .returns('an invalid token');
      getUserData.withArgs('an invalid token')
        .returns(false);

      return timeframesController.putOnId(req, res).then(function() {
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

      return timeframesController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      })
    });
  });

  describe('DELETE /timeframes/:id', function() {
    var destroy;

    beforeEach(function() {
      destroy = sinon.stub(timeframeService, 'destroy');
    });

    afterEach(function() {
      destroy.restore();
    });

    it('should respond with the timeframe ID and 200 status on success', function() {
      req.params = {id: 1};
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});
      destroy.withArgs(req.params.id)
        .returns(Promise.resolve(true));

      return timeframesController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith([{deletedId: 1}]);
        res.status.should.have.been.calledWith(200);
      })
    });

    it('should respond with an error and 404 status if timeframe does not exist', function() {
      req.params = {id: 2};
      var error = new errors.ResourceNotFoundError('Timeframe', req.params.id);
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});
      destroy.withArgs(req.params.id)
        .returns(Promise.resolve(false));

      return timeframesController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      })
    });

    it('should respond with an error and 409 status if there is a foreign constraint error', function() {
      req.params = {id: 2};
      var dbError = new Error();
      dbError.name = 'SequelizeForeignKeyConstraintError';
      var error = new errors.ForeignConstraintError('Timeframe');
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});
      destroy.withArgs(req.params.id)
        .returns(Promise.reject(dbError));

      return timeframesController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(409);
      })
    });

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});

      return timeframesController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      reqGet.withArgs('Bearer')
        .returns('an invalid token');
      getUserData.withArgs('an invalid token')
        .returns(false);

      return timeframesController.removeById(req, res).then(function() {
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

      return timeframesController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      })
    });
  });
});
