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
var BaseReminder = require('../../models').BaseReminder;



xdescribe('Base Reminders Controller', function() {
  xdescribe('GET /base_reminders', function() {
    var req, res, baseRemindersController, findAll;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      findAll = sinon.stub(BaseReminder, 'findAll');
      baseRemindersController = require('../../controllers/baseRemindersController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      findAll.restore();
    });

    it('should respond with an array of all baseReminders and a 200 status', function() {
      var baseReminders = [{
        id: '1',
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your essay',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        timeframeIds: [1, 2],
        categoryId: 1
      }, {
        id: '2',
        name: 'Get Recommendations',
        message: 'Ask your counselor',
        detail: 'Tips for asking your counselor',
        lateMessage: 'Too late',
        lateDetail: '',
        timeframeIds: [3],
        categoryId: 2
      }];
      findAll.returns(Promise.resolve(baseReminders.map(
        function(baseReminder) {
          return {dataValues: baseReminder};
        }
      )));

      return baseRemindersController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith(baseReminders);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond with an empty array and a 200 status if there are no baseReminders', function() {
      findAll.returns(Promise.resolve([]));

      return baseRemindersController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith([]);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond with an error object and a 500 status on a database error', function() {
      var error = new Error('database error');
      findAll.returns(Promise.reject(error));

      return baseRemindersController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });

    });
  });

  xdescribe('GET /base_reminders/:id', function() {
    var req, res, baseRemindersController, findById;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      findById = sinon.stub(BaseReminder, 'findById');
      baseRemindersController = require('../../controllers/baseRemindersController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      findById.restore();
    });

    it('should respond with an array with the matching baseReminder and a 200 status', function() {
      req.params = {id: 1};
      var baseReminder = {
        id: '1',
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your essay',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        timeframeIds: [1, 2],
        categoryId: 1
      };
      findById.withArgs(1)
        .returns(Promise.resolve({dataValues: baseReminder}));

      return baseRemindersController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith([baseReminder]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should an error object and a 404 status if the baseReminder does not exist', function() {
      req.params = {id: 2};
      var error = new errors.ResourceNotFoundError('BaseReminder', req.params.id);
      findById.withArgs(2)
        .returns(Promise.resolve(null));

      return baseRemindersController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      });

    });

    it('should respond with an error object and a 500 status on a database error', function() {
      req.params = {id: 1};
      var error = new Error('database error');
      findById.returns(Promise.reject(error));

      return baseRemindersController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });

    });
  });

  xdescribe('POST /base_reminders', function() {
    var req, res, baseRemindersController, BaseReminderStub;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      BaseReminderStub = sinon.stub(BaseReminder, 'create');
      baseRemindersController = require('../../controllers/baseRemindersController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      BaseReminderStub.restore();
    });

    it('should respond with new baseReminder object and 200 status with a valid request', function() {
      req.body = {
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your essay',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        timeframeIds: [1, 2],
        categoryId: 1
      };

      var successfulCreateResponse = {
        id: '2',
        name: req.body.name,
        message: req.body.message,
        detail: req.body.detail,
        lateMessage: req.body.lateMessage,
        lateDetail: req.body.lateDetail,
        timeframeIds: req.body.timeframeIds,
        categoryId: req.body.categoryId
      };
      BaseReminderStub.returns(Promise.resolve({dataValues: successfulCreateResponse}));

      return baseRemindersController.post(req, res).then(function() {
        res.json.should.have.been.calledWith([successfulCreateResponse]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should respond with new baseReminder object and 200 status if optional fields are missing', function() {
      req.body = {
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your essay',
        timeframeIds: [1, 2],
        categoryId: 1
      };

      var successfulCreateResponse = {
        id: '2',
        name: req.body.name,
        message: req.body.message,
        detail: req.body.detail,
        lateMessage: null,
        lateDetail: null,
        timeframeIds: req.body.timeframeIds,
        categoryId: req.body.categoryId
      };
      BaseReminderStub.returns(Promise.resolve({dataValues: successfulCreateResponse}));

      return baseRemindersController.post(req, res).then(function() {
        res.json.should.have.been.calledWith([successfulCreateResponse]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should respond with an error and 400 status on if there are fields missing', function() {
      req.body = {
        name: 'Write Essay',
        message: 'Better get writing!',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        timeframeIds: [1, 2]
      };
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
        detail: 'Some help for writing your essay',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        timeframeIds: '1, 2',
        categoryId: 1
      };
      var error = new errors.ValidationError([{
        field: 'timeframeIds',
        message: 'must be an array of timeframe IDs'
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
        detail: 'Some help for writing your essay',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        timeframeIds: [],
        categoryId: 1
      };
      var error = new errors.ValidationError([{
        field: 'timeframeIds',
        message: 'must be an array of timeframe IDs'
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
        detail: 'Some help for writing your essay',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        timeframeIds: ['now'],
        categoryId: 1
      };
      var error = new errors.ValidationError([{
        field: 'timeframeIds',
        message: 'must be an array of timeframe IDs'
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
        detail: 'Some help for writing your essay',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        timeframeIds: [1, 2],
        categoryId: 'Essays'
      };
      var error = new errors.ValidationError([{
        field: 'categoryId',
        message: 'must be a number'
      }]);

      return baseRemindersController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.body = {name: 'Essay'};
      var databaseError = new Error('some database error');
      BaseReminderStub.returns(Promise.reject(databaseError));

      return baseRemindersController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(databaseError);
        res.status.should.have.been.calledWith(500);
      });
    });
  });

  xdescribe('PUT /base_reminders/:id', function() {
    var req, res, baseRemindersController, findById, baseReminder, update;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      findById = sinon.stub(BaseReminder, 'findById');
      baseReminder = {update: function(values) {}};
      update = sinon.stub(baseReminder, 'update');
      baseRemindersController = require('../../controllers/baseRemindersController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      findById.restore();
      update.restore();
    });

    it('should respond with the updated baseReminder object and 200 status on valid request', function() {
      req.body = {
        name: 'Write Essays',
        timeframeIds: [1]
      };
      req.params = {id: 1};
      var updatedBaseReminder = {
        name: 'Write Essays',
        message: 'Better get writing!',
        detail: 'Some help for writing your essay',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        timeframeIds: [1],
        categoryId: 1
      };
      findById.withArgs(1)
        .returns(Promise.resolve(baseReminder));
      update.withArgs(req.body)
        .returns(Promise.resolve({dataValues: updatedBaseReminder}));

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
      findById.withArgs(2)
        .returns(Promise.resolve(null));

      return baseRemindersController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      })
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.body = {name: 'Essay'};
      req.params = {id: 1};
      var error = new Error('database error');
      findById.withArgs(1)
        .returns(Promise.resolve(baseReminder));
      update.withArgs(req.body)
        .returns(Promise.reject(error));

      return baseRemindersController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      })
    });
  });

  xdescribe('DELETE /base_reminders/:id', function() {
    var req, res, baseRemindersController, findById, baseReminder, destroy;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      findById = sinon.stub(BaseReminder, 'findById');
      baseReminder = {destroy: function(values) {}};
      destroy = sinon.stub(baseReminder, 'destroy');
      baseRemindersController = require('../../controllers/baseRemindersController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      findById.restore();
      destroy.restore();
    });

    it('should respond with the baseReminder ID and 200 status on success', function() {
      req.params = {id: 1};
      findById.withArgs(1)
        .returns(Promise.resolve(baseReminder));
      destroy.withArgs()
        .returns(Promise.resolve());

      return baseRemindersController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith([{deletedId: 1}]);
        res.status.should.have.been.calledWith(200);
      })
    });

    it('should respond with an error and 404 status if baseReminder does not exist', function() {
      req.params = {id: 2};
      var error = new errors.ResourceNotFoundError('BaseReminder', req.params.id);
      findById.withArgs(2)
        .returns(Promise.resolve(null));

      return baseRemindersController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      })
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.params = {id: 1};
      var error = new Error('database error');
      findById.withArgs(1)
        .returns(Promise.resolve(baseReminder));
      destroy.withArgs()
        .returns(Promise.reject(error));

      return baseRemindersController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      })
    });
  });
});
