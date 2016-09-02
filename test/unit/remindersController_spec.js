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
    var findByUser;

    beforeEach(function() {
      findByUser = sinon.stub(reminderService, 'findByUser');
    });

    afterEach(function() {
      findByUser.restore();
    });

    it('should respond with an array of all reminders and a 200 status', function() {
      var reminders = [{
        id: '1',
        userId: '1',
        schoolId: '1',
        name: 'Write Essays',
        message: 'Write Your Essays',
        detail: 'More detail about essays',
        lateMessage: 'Your Essays are late',
        lateDetail: 'What to do about late essays',
        dueDate: '2017-02-01',
        timeframe: 'One week before'
      }, {
        id: '2',
        userId: '1',
        schoolId: '1',
        name: 'Get Recommendations',
        message: 'Ask counselor for recommendations',
        detail: 'More detail about recommendations',
        lateMessage: 'Your recommendations are late',
        lateDetail: 'What to do about late recommendations',
        dueDate: '2017-02-01',
        timeframe: 'One week before'
      }];

      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});
      findByUser.withArgs(1)
        .returns(Promise.resolve(reminders));

      return remindersController.getAllForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(reminders);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond with an empty array and a 200 status if there are no reminders', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});
      findByUser.withArgs(1)
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
      findByUser.returns(Promise.reject(error));

      return remindersController.getAllForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });

    });
  });

  describe('GET /reminders/school/:id', function() {
    var findByResourceForUser;

    beforeEach(function() {
      req.params = {id: 1};
      findByResourceForUser = sinon.stub(reminderService, 'findByResourceForUser');
    });

    afterEach(function() {
      findByResourceForUser.restore();
    });

    it('should respond with an array of all reminders belonging to school ID and a 200 status', function() {
      var reminders = [{
        id: '1',
        userId: '1',
        schoolId: '1',
        name: 'Write Essays',
        message: 'Write Your Essays',
        detail: 'More detail about essays',
        lateMessage: 'Your Essays are late',
        lateDetail: 'What to do about late essays',
        dueDate: '2017-02-01',
        timeframe: 'One week before'
      }, {
        id: '2',
        userId: '1',
        schoolId: '1',
        name: 'Get Recommendations',
        message: 'Ask counselor for recommendations',
        detail: 'More detail about recommendations',
        lateMessage: 'Your recommendations are late',
        lateDetail: 'What to do about late recommendations',
        dueDate: '2017-02-01',
        timeframe: 'One week before'
      }];

      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});
      findByResourceForUser.withArgs('School', 1, 1)
        .returns(Promise.resolve(reminders));

      return remindersController.getAllForSchoolForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(reminders);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond with an empty array and a 200 status if there are no reminders matching the school ID', function() {
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});
      findByResourceForUser.withArgs('School', 1, 1)
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
      findByResourceForUser.returns(Promise.reject(error));

      return remindersController.getAllForSchoolForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });

    });
  });

  describe('GET /reminders/:id', function() {
    var findByIdForUser;

    beforeEach(function() {
      req.params = {id: 1};
      findByIdForUser = sinon.stub(reminderService, 'findByIdForUser');
      remindersController = require('../../controllers/remindersController');
    });

    afterEach(function() {
      findByIdForUser.restore();
    });

    it('should respond with an array with the matching reminder and a 200 status', function() {
      var reminder = {
        id: '1',
        userId: '1',
        schoolId: '1',
        name: 'Write Essays',
        message: 'Write Your Essays',
        detail: 'More detail about essays',
        lateMessage: 'Your Essays are late',
        lateDetail: 'What to do about late essays',
        dueDate: '2017-02-01',
        timeframe: 'One week before'
      };
      reqGet.withArgs('Bearer')
        .returns('a valid token');
      getUserData.withArgs('a valid token')
        .returns({userId: 1, role: 'user'});
      findByIdForUser.withArgs(1, 1)
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
      findByIdForUser.withArgs(1, 1)
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
      findByIdForUser.returns(Promise.reject(error));

      return remindersController.getByIdForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });
    });
  });
});
