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
var reminderService = require('../../services/reminderService');
var auth = require('../../services/authService');

describe('Reminders Controller', function() {
  var reminderServiceResponse = [{
    id: '1',
    dueDate: '2017-02-06',
    timeframe: 'One day before',
    name: 'Write Essay',
    message: 'Better get writing!',
    detail: 'Some help for writing your essay',
    lateMessage: 'Too late',
    lateDetail: 'Should have started sooner',
    category: 'Essays'
  }, {
    id: '2',
    dueDate: '2017-02-01',
    timeframe: 'One week before',
    name: 'Get Recommendations',
    message: 'Ask your counselor',
    detail: 'Tips for asking your counselor',
    lateMessage: 'Too late',
    lateDetail: '',
    category: 'Recommendations'
  }];

  var reminderControllerResponse = [{
    dueDate: '2017-02-01',
    reminders: [{
      id: '2',
      name: 'Get Recommendations',
      message: 'Ask your counselor',
      detail: 'Tips for asking your counselor',
      lateMessage: 'Too late',
      lateDetail: '',
      category: 'Recommendations',
      timeframe: 'One week before'
    }]
  }, {
    dueDate: '2017-02-06',
    reminders: [{
      id: '1',
      name: 'Write Essay',
      message: 'Better get writing!',
      detail: 'Some help for writing your essay',
      lateMessage: 'Too late',
      lateDetail: 'Should have started sooner',
      category: 'Essays',
      timeframe: 'One day before'
    }]
  }];

  var req, res, remindersController, reqGet, getUserData;

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
    remindersController = require('../../controllers/remindersController');
  });

  afterEach(function() {
    res.status.reset();
    res.json.reset();
    reqGet.restore();
    getUserData.restore();
  });

  describe('GET /reminders', function() {
    var findByUserWithBaseReminders;

    beforeEach(function() {
      findByUserWithBaseReminders = sinon.stub(reminderService, 'findByUserWithBaseReminders');
    });

    afterEach(function() {
      findByUserWithBaseReminders.restore();
    });

    it('should respond with an array of all reminders grouped & sorted by dueDate and a 200 status', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});
      findByUserWithBaseReminders.withArgs(1)
        .returns(Promise.resolve(reminderServiceResponse));

      return remindersController.getAllForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(reminderControllerResponse);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond with an empty array and a 200 status if there are no reminders', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});
      findByUserWithBaseReminders.withArgs(1)
        .returns(Promise.resolve([]));

      return remindersController.getAllForUser(req, res).then(function() {
        res.json.should.have.been.calledWith([]);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});

      return remindersController.getAllForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      reqGet.withArgs('Bearer')
        .returns('an invalid token');
      getUserData.withArgs('an invalid token')
        .returns(false);

      return remindersController.getAllForUser(req, res).then(function() {
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
      findByUserWithBaseReminders.returns(Promise.reject(error));

      return remindersController.getAllForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });

    });
  });

  describe('GET /reminders/school/:id', function() {
    var findByUserForSchoolWithBaseReminders;

    beforeEach(function() {
      req.params = {id: 1};
      findByUserForSchoolWithBaseReminders = sinon.stub(reminderService, 'findByUserForSchoolWithBaseReminders');
    });

    afterEach(function() {
      findByUserForSchoolWithBaseReminders.restore();
    });

    it('should respond with an array of all reminders belonging to school ID group & sorted by dueDate, and a 200 status', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});
      findByUserForSchoolWithBaseReminders.withArgs(1, 1)
        .returns(Promise.resolve(reminderServiceResponse));

      return remindersController.getAllForSchoolForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(reminderControllerResponse);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond with an empty array and a 200 status if there are no reminders matching the school ID', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});
      findByUserForSchoolWithBaseReminders.withArgs(1, 1)
        .returns(Promise.resolve([]));

      return remindersController.getAllForSchoolForUser(req, res).then(function() {
        res.json.should.have.been.calledWith([]);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});

      return remindersController.getAllForSchoolForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      reqGet.withArgs('Bearer')
        .returns('an invalid token');
      getUserData.withArgs('an invalid token')
        .returns(false);

      return remindersController.getAllForSchoolForUser(req, res).then(function() {
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
      findByUserForSchoolWithBaseReminders.returns(Promise.reject(error));

      return remindersController.getAllForSchoolForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });

    });
  });

  describe('GET /reminders/:id', function() {
    var findByIdForUserWithBaseReminders;

    beforeEach(function() {
      req.params = {id: 1};
      findByIdForUserWithBaseReminders = sinon.stub(reminderService, 'findByIdForUserWithBaseReminders');
      remindersController = require('../../controllers/remindersController');
    });

    afterEach(function() {
      findByIdForUserWithBaseReminders.restore();
    });

    it('should respond with an array with the matching reminder and a 200 status', function() {
      var reminder = {
        id: '1',
        dueDate: '2017-02-06',
        timeframe: 'One day before',
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your essay',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        category: 'Essays'
      };
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});
      findByIdForUserWithBaseReminders.withArgs(1, 1)
        .returns(Promise.resolve([reminder]));

      return remindersController.getByIdForUser(req, res).then(function() {
        res.json.should.have.been.calledWith([reminder]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should an error object and a 404 status if the reminder does not exist', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});

      var error = new errors.ResourceNotFoundError('Reminder', req.params.id);
      findByIdForUserWithBaseReminders.withArgs(1, 1)
        .returns(Promise.resolve([]));

      return remindersController.getByIdForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      });
    });

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'admin'});

      return remindersController.getByIdForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      reqGet.withArgs('Bearer')
        .returns('an invalid token');
      getUserData.withArgs('an invalid token')
        .returns(false);

      return remindersController.getByIdForUser(req, res).then(function() {
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
      findByIdForUserWithBaseReminders.returns(Promise.reject(error));

      return remindersController.getByIdForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });
    });
  });
});
