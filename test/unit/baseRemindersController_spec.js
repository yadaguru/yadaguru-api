/* globals xdescribe, beforeEach, it, afterEach */
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


describe('Base Reminders Controller', function() {
  var req, res, baseRemindersController, reqGet, getUserData, yadaguruDataMock;

  beforeEach(function() {
    yadaguruDataMock = mocks.getYadaguruDataMock('baseReminderService');
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
    baseRemindersController = proxyquire('../../controllers/baseRemindersController', {
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

  describe('GET /base_reminders', function() {
    it('should respond with an array of all baseReminders and a 200 status', function() {
      var baseReminders = [{
        id: '1',
        name: 'Write Essay',
        message: 'Better get writing!',
        smsMessage: 'Better get writing!',
        detail: 'Some help for writing your essay',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        timeframeIds: [1, 2],
        categoryId: 1
      }, {
        id: '2',
        name: 'Get Recommendations',
        message: 'Ask your counselor',
        smsMessage: 'Ask your counselor',
        detail: 'Tips for asking your counselor',
        lateMessage: 'Too late',
        lateDetail: '',
        timeframeIds: [3],
        categoryId: 2
      }];
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      yadaguruDataMock.services.baseReminderService.stubs.findAll.withArgs()
        .returns(Promise.resolve(baseReminders));

      return baseRemindersController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith(baseReminders);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond with an empty array and a 200 status if there are no baseReminders', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      yadaguruDataMock.services.baseReminderService.stubs.findAll.withArgs()
        .returns(Promise.resolve([]));

      return baseRemindersController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith([]);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'user'});

      return baseRemindersController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer an invalid token');
      getUserData.withArgs('Bearer an invalid token')
        .returns(false);

      return baseRemindersController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond with an error object and a 500 status on a database error', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      var error = new Error('database error');
      yadaguruDataMock.services.baseReminderService.stubs.findAll.returns(Promise.reject(error));

      return baseRemindersController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });

    });
  });

  describe('GET /base_reminders/:id', function() {
    it('should respond with an array with the matching baseReminder and a 200 status', function() {
      req.params = {id: 1};
      var baseReminder = {
        id: '1',
        name: 'Write Essay',
        message: 'Better get writing!',
        smsMessage: 'Better get writing!',
        detail: 'Some help for writing your essay',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        timeframeIds: [1, 2],
        categoryId: 1
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      yadaguruDataMock.services.baseReminderService.stubs.findById.withArgs(1)
        .returns(Promise.resolve([baseReminder]));

      return baseRemindersController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith([baseReminder]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should an error object and a 404 status if the baseReminder does not exist', function() {
      req.params = {id: 2};
      var error = new errors.ResourceNotFoundError('BaseReminder', req.params.id);
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      yadaguruDataMock.services.baseReminderService.stubs.findById.withArgs(2)
        .returns(Promise.resolve([]));

      return baseRemindersController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      });

    });


    it('should respond a 401 error if the user role is not authorized for this route', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'user'});

      return baseRemindersController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer an invalid token');
      getUserData.withArgs('Bearer an invalid token')
        .returns(false);

      return baseRemindersController.getById(req, res).then(function() {
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
      yadaguruDataMock.services.baseReminderService.stubs.findById.returns(Promise.reject(error));

      return baseRemindersController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });
    });
  });

  describe('POST /base_reminders', function() {
    it('should respond with new baseReminder object and 200 status with a valid request', function() {
      req.body = {
        name: 'Write Essay',
        message: 'Better get writing!',
        smsMessage: 'Better get writing!',
        detail: 'Some help for writing your essay',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        timeframeIds: [1, 2],
        categoryId: '1'
      };

      var successfulCreateResponse = {
        id: '2',
        name: req.body.name,
        message: req.body.message,
        smsMessage: req.body.smsMessage,
        detail: req.body.detail,
        lateMessage: req.body.lateMessage,
        lateDetail: req.body.lateDetail,
        timeframeIds: req.body.timeframeIds,
        categoryId: req.body.categoryId
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      yadaguruDataMock.services.baseReminderService.stubs.create.returns(Promise.resolve([successfulCreateResponse]));

      return baseRemindersController.post(req, res).then(function() {
        res.json.should.have.been.calledWith([successfulCreateResponse]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should respond with new baseReminder object and 200 status if optional fields are missing', function() {
      req.body = {
        name: 'Write Essay',
        message: 'Better get writing!',
        smsMessage: 'Better get writing!',
        detail: 'Some help for writing your essay',
        timeframeIds: [1, 2],
        categoryId: '1'
      };

      var successfulCreateResponse = {
        id: '2',
        name: req.body.name,
        message: req.body.message,
        smsMessage: req.body.smsMessage,
        detail: req.body.detail,
        lateMessage: null,
        lateDetail: null,
        timeframeIds: req.body.timeframeIds,
        categoryId: req.body.categoryId
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      yadaguruDataMock.services.baseReminderService.stubs.create.returns(Promise.resolve([successfulCreateResponse]));

      return baseRemindersController.post(req, res).then(function() {
        res.json.should.have.been.calledWith([successfulCreateResponse]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should respond with an error and 400 status on if there are fields missing', function() {
      req.body = {
        name: 'Write Essay',
        message: 'Better get writing!',
        smsMessage: 'Better get writing!',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        timeframeIds: [1, 2]
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      var error = new errors.ValidationError([{
        field: 'detail',
        message: 'is required'
      }, {
        field: 'categoryId',
        message: 'is required'
      }]);

      return baseRemindersController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond with an error and 400 status if timeframeIds is not an array', function() {
      req.body = {
        name: 'Write Essay',
        message: 'Better get writing!',
        smsMessage: 'Better get writing!',
        detail: 'Some help for writing your essay',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        timeframeIds: '1, 2',
        categoryId: '1'
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      var error = new errors.ValidationError([{
        field: 'timeframeIds',
        message: 'must be an array of timeframe IDs',
        value: '1, 2'
      }]);

      return baseRemindersController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond with an error and 400 status if timeframeIds is an empty array', function() {
      req.body = {
        name: 'Write Essay',
        message: 'Better get writing!',
        smsMessage: 'Better get writing!',
        detail: 'Some help for writing your essay',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        timeframeIds: [],
        categoryId: '1'
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      var error = new errors.ValidationError([{
        field: 'timeframeIds',
        message: 'must be an array of timeframe IDs',
        value: []
      }]);

      return baseRemindersController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond with an error and 400 status if timeframeIds is an array that contains non-numbers', function() {
      req.body = {
        name: 'Write Essay',
        message: 'Better get writing!',
        smsMessage: 'Better get writing!',
        detail: 'Some help for writing your essay',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        timeframeIds: ['now'],
        categoryId: '1'
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      var error = new errors.ValidationError([{
        field: 'timeframeIds',
        message: 'must be an array of timeframe IDs',
        value: ['now']
      }]);

      return baseRemindersController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond with an error and 400 status if categoryId is not a number', function() {
      req.body = {
        name: 'Write Essay',
        message: 'Better get writing!',
        smsMessage: 'Better get writing!',
        detail: 'Some help for writing your essay',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        timeframeIds: [1, 2],
        categoryId: 'Essays'
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      var error = new errors.ValidationError([{
        field: 'categoryId',
        message: 'must be a number',
        value: 'Essays'
      }]);

      return baseRemindersController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond with an error and 400 status if smsMessage is longer than 22 characters', function() {
      req.body = {
        name: 'Write Essay',
        message: 'Better get writing!',
        smsMessage: 'Better get writing!!!!!',
        detail: 'Some help for writing your essay',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        timeframeIds: [1, 2],
        categoryId: '1'
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      var error = new errors.ValidationError([{
        field: 'smsMessage',
        message: 'must be 22 characters or shorter',
        value: 'Better get writing!!!!!'
      }]);

      return baseRemindersController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      req.body = {
        name: 'Write Essay',
        message: 'Better get writing!',
        smsMessage: 'Better get writing!',
        detail: 'Some help for writing your essay',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        timeframeIds: [1, 2],
        categoryId: '1'
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'user'});

      return baseRemindersController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      req.body = {
        name: 'Write Essay',
        message: 'Better get writing!',
        smsMessage: 'Better get writing!',
        detail: 'Some help for writing your essay',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        timeframeIds: [1, 2],
        categoryId: '1'
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer an invalid token');
      getUserData.withArgs('Bearer an invalid token')
        .returns(false);

      return baseRemindersController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.body = {
        name: 'Write Essay',
        message: 'Better get writing!',
        smsMessage: 'Better get writing!',
        detail: 'Some help for writing your essay',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        timeframeIds: [1, 2],
        categoryId: '1'
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      var databaseError = new Error('some database error');
      yadaguruDataMock.services.baseReminderService.stubs.create.returns(Promise.reject(databaseError));

      return baseRemindersController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(databaseError);
        res.status.should.have.been.calledWith(500);
      });
    });
  });

  describe('PUT /base_reminders/:id', function() {
    it('should respond with the updated baseReminder object and 200 status on valid request', function() {
      req.body = {
        name: 'Write Essays',
        timeframeIds: [1]
      };
      req.params = {id: 1};
      var updatedBaseReminder = {
        name: 'Write Essays',
        message: 'Better get writing!',
        smsMssage: 'Better get writing!',
        detail: 'Some help for writing your essay',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        timeframeIds: [1],
        categoryId: 1
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      yadaguruDataMock.services.baseReminderService.stubs.update.returns(Promise.resolve([updatedBaseReminder]));

      return baseRemindersController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith([updatedBaseReminder]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should respond with an error and 404 status if baseReminder does not exist', function() {
      req.body = {
        name: 'Write Essays'
      };
      req.params = {id: 2};
      var error = new errors.ResourceNotFoundError('BaseReminder', req.params.id);
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      yadaguruDataMock.services.baseReminderService.stubs.update.withArgs(2)
        .returns(Promise.resolve(false));

      return baseRemindersController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      })
    });

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      req.body = {name: 'Essay'};
      req.params = {id: 1};
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'user'});

      return baseRemindersController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      req.body = {name: 'Essay'};
      req.params = {id: 1};
      reqGet.withArgs('Authorization')
        .returns('Bearer an invalid token');
      getUserData.withArgs('Bearer an invalid token')
        .returns(false);

      return baseRemindersController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.body = {name: 'Essay'};
      req.params = {id: 1};
      var error = new Error('database error');
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      yadaguruDataMock.services.baseReminderService.stubs.update.withArgs(req.params.id, req.body)
        .returns(Promise.reject(error));

      return baseRemindersController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      })
    });
  });

  describe('DELETE /base_reminders/:id', function() {
    it('should respond with the baseReminder ID and 200 status on success', function() {
      req.params = {id: 1};
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      yadaguruDataMock.services.baseReminderService.stubs.destroy.withArgs(req.params.id)
        .returns(Promise.resolve(true));

      return baseRemindersController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith([{deletedId: 1}]);
        res.status.should.have.been.calledWith(200);
      })
    });

    it('should respond with an error and 404 status if baseReminder does not exist', function() {
      req.params = {id: 2};
      var error = new errors.ResourceNotFoundError('BaseReminder', req.params.id);
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      yadaguruDataMock.services.baseReminderService.stubs.destroy.withArgs(req.params.id)
        .returns(Promise.resolve(false));

      return baseRemindersController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      })
    });

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      req.params = {id: 1};
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'user'});

      return baseRemindersController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      req.params = {id: 1};
      reqGet.withArgs('Authorization')
        .returns('Bearer an invalid token');
      getUserData.withArgs('Bearer an invalid token')
        .returns(false);

      return baseRemindersController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.params = {id: 1};
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});
      var error = new Error('database error');
      yadaguruDataMock.services.baseReminderService.stubs.destroy.withArgs()
        .returns(Promise.reject(error));

      return baseRemindersController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      })
    });
  });
});
