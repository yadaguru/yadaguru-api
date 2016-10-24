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
var reminderGen = require('../../services/reminderGenerationService');
var auth = require('../../services/authService');

describe('Reminders Controller', function() {
  var reminderServiceResponse, reminderControllerResponse, getTestRemindersResponse;
  var req, res, remindersController, reqGet, getUserData, getTestReminders;

  beforeEach(function() {
    reminderServiceResponse = [{
      id: '1',
      dueDate: '2017-02-06',
      timeframe: 'One day before',
      name: 'Write Essay',
      message: 'Better get writing for %SCHOOL%!',
      detail: 'Some help for writing your essay that is due on %REMINDER_DATE%',
      lateMessage: 'Too late',
      lateDetail: 'Should have started sooner',
      category: 'Essays',
      baseReminderId: '1',
      schoolId: '1',
      schoolName: 'Temple',
      schoolDueDate: '2017-02-07'
    }, {
      id: '2',
      dueDate: '2017-02-01',
      timeframe: 'One week before',
      name: 'Get Recommendations',
      message: 'Ask your counselor. Application is due on %APPLICATION_DATE%',
      detail: 'Tips for asking your counselor',
      lateMessage: 'Too late',
      lateDetail: '',
      category: 'Recommendations',
      baseReminderId: '2',
      schoolId: '1',
      schoolName: 'Temple',
      schoolDueDate: '2017-02-07'
    }, {
      id: '3',
      dueDate: '2017-02-01',
      timeframe: 'One week before',
      name: 'Get Recommendations',
      message: 'Ask your counselor. Application is due on %APPLICATION_DATE%',
      detail: 'Tips for asking your counselor',
      lateMessage: 'Too late',
      lateDetail: '',
      category: 'Recommendations',
      baseReminderId: '2',
      schoolId: '2',
      schoolName: 'Drexel',
      schoolDueDate: '2017-02-07'
    }];

    reminderControllerResponse = [{
      dueDate: '2017-02-01',
      reminders: [{
        id: ['2', '3'],
        name: 'Get Recommendations',
        message: 'Ask your counselor. Application is due on 2/7/2017',
        detail: 'Tips for asking your counselor',
        lateMessage: 'Too late',
        lateDetail: ''
      }, {
        id: '3',
        name: 'ACT test today',
        message: 'A message about the test',
        detail: 'Some details',
        lateMessage: '',
        lateDetail: ''
      }]
    }, {
      dueDate: '2017-02-06',
      reminders: [{
        id: '1',
        name: 'Write Essay',
        message: 'Better get writing for Temple!',
        detail: 'Some help for writing your essay that is due on 2/6/2017',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner'
      }]
    }, {
      dueDate: '2017-02-15',
      reminders: [{
        id: '4',
        name: 'ACT test today',
        message: 'A message about the test',
        detail: 'Some details',
        lateMessage: '',
        lateDetail: ''
      }]
    }];

    getTestRemindersResponse = [{
      dueDate: '2017-02-01',
      id: '3',
      name: 'ACT test today',
      message: 'A message about the test',
      detail: 'Some details',
      registrationDate: '2017-01-01',
      adminDate: '2017-02-01'
    }, {
      dueDate: '2017-02-15',
      id: '4',
      name: 'ACT test today',
      message: 'A message about the test',
      detail: 'Some details',
      registrationDate: '2017-01-15',
      adminDate: '2017-02-15'
    }];

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
    getTestReminders = sinon.stub(reminderGen, 'getTestReminders');
  });

  afterEach(function() {
    res.status.reset();
    res.json.reset();
    reqGet.restore();
    getUserData.restore();
    getTestReminders.restore();
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
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'user'});
      findByUserWithBaseReminders.withArgs(1)
        .returns(Promise.resolve(reminderServiceResponse));
      getTestReminders
        .returns(Promise.resolve(getTestRemindersResponse));

      return remindersController.getAllForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(reminderControllerResponse);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond with an empty array and a 200 status if there are no reminders', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'user'});
      findByUserWithBaseReminders.withArgs(1)
        .returns(Promise.resolve([]));
      getTestReminders
        .returns(Promise.resolve([]));

      return remindersController.getAllForUser(req, res).then(function() {
        res.json.should.have.been.calledWith([]);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});

      return remindersController.getAllForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer an invalid token');
      getUserData.withArgs('Bearer an invalid token')
        .returns(false);

      return remindersController.getAllForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond with an error object and a 500 status on a database error', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
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
    var findByUserForSchoolWithBaseReminders, reminderServiceResponseForSchool, reminderControllerResponseForSchool;


    beforeEach(function() {
      reminderServiceResponseForSchool = [reminderServiceResponse[0], reminderServiceResponse[1]];

      reminderControllerResponseForSchool = [{
        dueDate: '2017-02-01',
        reminders: [{
          id: '2',
          name: 'Get Recommendations',
          message: 'Ask your counselor. Application is due on 2/7/2017',
          detail: 'Tips for asking your counselor',
          lateMessage: 'Too late',
          lateDetail: ''
        }, {
          id: '3',
          name: 'ACT test today',
          message: 'A message about the test',
          detail: 'Some details',
          lateMessage: '',
          lateDetail: ''
        }]
      }, {
        dueDate: '2017-02-06',
        reminders: [{
          id: '1',
          name: 'Write Essay',
          message: 'Better get writing for Temple!',
          detail: 'Some help for writing your essay that is due on 2/6/2017',
          lateMessage: 'Too late',
          lateDetail: 'Should have started sooner'
        }]
      }, {
        dueDate: '2017-02-15',
        reminders: [{
          id: '4',
          name: 'ACT test today',
          message: 'A message about the test',
          detail: 'Some details',
          lateMessage: '',
          lateDetail: ''
        }]
      }];
      req.params = {id: 1};
      findByUserForSchoolWithBaseReminders = sinon.stub(reminderService, 'findByUserForSchoolWithBaseReminders');
    });

    afterEach(function() {
      findByUserForSchoolWithBaseReminders.restore();
    });

    it('should respond with an array of all reminders belonging to school ID group & sorted by dueDate, and a 200 status', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'user'});
      findByUserForSchoolWithBaseReminders.withArgs(1, 1)
        .returns(Promise.resolve(reminderServiceResponseForSchool));
      getTestReminders
        .returns(Promise.resolve(getTestRemindersResponse));

      return remindersController.getAllForSchoolForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(reminderControllerResponseForSchool);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond with an empty array and a 200 status if there are no reminders matching the school ID', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'user'});
      findByUserForSchoolWithBaseReminders.withArgs(1, 1)
        .returns(Promise.resolve([]));
      getTestReminders
        .returns(Promise.resolve([]));

      return remindersController.getAllForSchoolForUser(req, res).then(function() {
        res.json.should.have.been.calledWith([]);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond a 401 error if the user role is not authorized for this route', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});

      return remindersController.getAllForSchoolForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer an invalid token');
      getUserData.withArgs('Bearer an invalid token')
        .returns(false);

      return remindersController.getAllForSchoolForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond with an error object and a 500 status on a database error', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
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
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your essay',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner'
      };
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'user'});
      findByIdForUserWithBaseReminders.withArgs(1, 1)
        .returns(Promise.resolve([reminder]));

      return remindersController.getByIdForUser(req, res).then(function() {
        res.json.should.have.been.calledWith([reminder]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should an error object and a 404 status if the reminder does not exist', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
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
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
        .returns({userId: 1, role: 'admin'});

      return remindersController.getByIdForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond a 401 error if the user token is invalid', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer an invalid token');
      getUserData.withArgs('Bearer an invalid token')
        .returns(false);

      return remindersController.getByIdForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(new errors.NotAuthorizedError());
        res.status.should.have.been.calledWith(401);
      });
    });

    it('should respond with an error object and a 500 status on a database error', function() {
      reqGet.withArgs('Authorization')
        .returns('Bearer a valid token');
      getUserData.withArgs('Bearer a valid token')
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
