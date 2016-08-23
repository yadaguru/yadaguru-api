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

describe('Reminders Controller', function() {
  describe('GET /reminders', function() {
    var req, res, remindersController, findByUser;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      findByUser = sinon.stub(reminderService, 'findByUser');
      remindersController = require('../../controllers/remindersController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
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
      findByUser.returns(Promise.resolve(reminders));

      return remindersController.getAllForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(reminders);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond with an empty array and a 200 status if there are no reminders', function() {
      findByUser.returns(Promise.resolve([]));

      return remindersController.getAllForUser(req, res).then(function() {
        res.json.should.have.been.calledWith([]);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond with an error object and a 500 status on a database error', function() {
      var error = new Error('database error');
      findByUser.returns(Promise.reject(error));

      return remindersController.getAllForUser(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });

    });
  });

  describe('GET /reminders/school/:id', function() {
    var req, res, remindersController, findBySchool;

    beforeEach(function() {
      req = {
        params: {id: 1}
      };
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      findBySchool = sinon.stub(reminderService, 'findBySchool');
      remindersController = require('../../controllers/remindersController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      findBySchool.restore();
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
      findBySchool.returns(Promise.resolve(reminders));

      return remindersController.getAllForSchool(req, res).then(function() {
        res.json.should.have.been.calledWith(reminders);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond with an empty array and a 200 status if there are no reminders matching the school ID', function() {
      findBySchool.returns(Promise.resolve([]));

      return remindersController.getAllForSchool(req, res).then(function() {
        res.json.should.have.been.calledWith([]);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond with an error object and a 500 status on a database error', function() {
      var error = new Error('database error');
      findBySchool.returns(Promise.reject(error));

      return remindersController.getAllForSchool(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });

    });
  });

  describe('GET /reminders/:id', function() {
    var req, res, remindersController, findById;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      findById = sinon.stub(reminderService, 'findById');
      remindersController = require('../../controllers/remindersController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      findById.restore();
    });

    it('should respond with an array with the matching reminder and a 200 status', function() {
      req.params = {id: 1};
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
      findById.withArgs(1)
        .returns(Promise.resolve([reminder]));

      return remindersController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith([reminder]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should an error object and a 404 status if the reminder does not exist', function() {
      req.params = {id: 2};
      var error = new errors.ResourceNotFoundError('Reminder', req.params.id);
      findById.withArgs(2)
        .returns(Promise.resolve([]));

      return remindersController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      });

    });

    it('should respond with an error object and a 500 status on a database error', function() {
      req.params = {id: 1};
      var error = new Error('database error');
      findById.returns(Promise.reject(error));

      return remindersController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });
    });
  });
});
