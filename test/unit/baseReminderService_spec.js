var sinon = require('sinon');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');
chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.should();

var models = require('../../models');
var BaseReminder = models.BaseReminder;
var baseReminderService = require('../../services/baseReminderService');

describe('The BaseReminders Service', function() {
  var baseRemindersDbResponse, baseReminders;

  beforeEach(function() {
    baseRemindersDbResponse = [{dataValues: {
      id: 1,
      name: 'Write Essays',
      message: 'Write Your Essays',
      detail: 'More detail about essays',
      lateMessage: 'Your Essays are late',
      lateDetail: 'What to do about late essays',
      categoryId: 1,
      Timeframes: [
        {dataValues: {id: 1}},
        {dataValues: {id: 2}}
      ]
    }}, {dataValues: {
      id: 1,
      name: 'Get Recommendations',
      message: 'Ask counselor for recommendations',
      detail: 'More detail about recommendations',
      lateMessage: 'Your recommendations are late',
      lateDetail: 'What to do about late recommendations',
      categoryId: 1,
      Timeframes: [
        {dataValues: {id: 3}}
      ]
    }}];
    baseReminders = [{
      id: 1,
      name: 'Write Essays',
      message: 'Write Your Essays',
      detail: 'More detail about essays',
      lateMessage: 'Your Essays are late',
      lateDetail: 'What to do about late essays',
      categoryId: 1,
      timeframeIds: [1, 2]
    }, {
      id: 1,
      name: 'Get Recommendations',
      message: 'Ask counselor for recommendations',
      detail: 'More detail about recommendations',
      lateMessage: 'Your recommendations are late',
      lateDetail: 'What to do about late recommendations',
      categoryId: 1,
      timeframeIds: [3]
    }];
  });

  afterEach(function() {
    baseRemindersDbResponse = undefined;
    baseReminders = undefined;
  });

  describe('The findAll function', function() {
    var findAll;

    beforeEach(function() {
      findAll = sinon.stub(BaseReminder, 'findAll');
    });

    afterEach(function() {
      findAll.restore();
    });

    it('should resolve with an array of objects representing baseReminders', function() {
      findAll.returns(Promise.resolve(baseRemindersDbResponse));

      return baseReminderService.findAll().should.eventually.deep.equal(baseReminders);
    });

    it('should resolve with an empty array there are no baseReminders', function() {
      findAll.returns(Promise.resolve([]));

      return baseReminderService.findAll().should.eventually.deep.equal([]);
    });
  });

  describe('The findById function', function() {
    var findById;

    beforeEach(function() {
      findById = sinon.stub(BaseReminder, 'findById');
    });

    afterEach(function() {
      findById.restore();
    });

    it('should resolve with an array with the matching baseReminder object', function() {
      findById.withArgs(1)
        .returns(Promise.resolve(baseRemindersDbResponse[0]));

      return baseReminderService.findById(1).should.eventually.deep.equal([baseReminders[0]]);
    });

    it('should resolve with an empty array if no baseReminders were found', function() {
      findById.withArgs(3)
        .returns(Promise.resolve(null));

      return baseReminderService.findById(3).should.eventually.deep.equal([]);
    });
  });

  describe('The create function', function() {
    var create, setTimeframes, newBaseReminderDbResponse, newTimeframeAssociations;

    var newBaseReminder = {
      name: 'Write Essays',
      message: 'Write Your Essays',
      detail: 'More detail about essays',
      lateMessage: 'Your Essays are late',
      lateDetail: 'What to do about late essays',
      categoryId: 1,
      timeframeIds: [1, 2]
    };

    beforeEach(function() {
      newBaseReminderDbResponse = {
        dataValues: {
          name: 'Write Essays',
          message: 'Write Your Essays',
          detail: 'More detail about essays',
          lateMessage: 'Your Essays are late',
          lateDetail: 'What to do about late essays',
          categoryId: 1
        },
        setTimeframes: function(){}
      };

      newTimeframeAssociations = [[{
        dataValues: {
          TimeframeId: 1
        }
      }, {
        dataValues: {
          TimeframeId: 2
        }
      }]];

      create = sinon.stub(BaseReminder, 'create');
      setTimeframes = sinon.stub(newBaseReminderDbResponse, 'setTimeframes');
    });

    after(function() {
      newBaseReminderDbResponse = undefined;
      newTimeframeAssociations = undefined;
      create.restore();
      setTimeframes.restore();
    });

    it('should resolve with an array containing the new baseReminder object', function() {
      create.returns(Promise.resolve(newBaseReminderDbResponse));
      setTimeframes.returns(Promise.resolve(newTimeframeAssociations));

      return baseReminderService.create(newBaseReminder).should.eventually.deep.equal([newBaseReminder]);
    });
  });

  xdescribe('The update function', function() {
    var findById, row, update, idToUpdate;

    var updatedBaseReminder = {
      name: 'Write Essays',
      message: 'Write Your Essays',
      detail: 'More detail about essays',
      lateMessage: 'Your Essays are late',
      lateDetail: 'What to do about late essays',
      categoryId: 1,
      timeframeIds: [1, 2]
    };

    idToUpdate = 1;

    before(function() {
      findById = sinon.stub(BaseReminder, 'findById');
      row = {update: function(){}};
      update = sinon.stub(row, 'update');
    });

    after(function() {
      findById.restore();
      update.restore();
    });

    it('should resolve with an array containing the updated baseReminder object', function() {
      findById.withArgs(idToUpdate)
        .returns(Promise.resolve(row));
      update.withArgs(updatedBaseReminder)
        .returns(Promise.resolve({dataValues: updatedBaseReminder}));

      return baseReminderService.update(idToUpdate, updatedBaseReminder).should.eventually.deep.equal([updatedBaseReminder]);
    });

    it('should resolve with false if the id does not exist', function() {
      findById.withArgs(idToUpdate)
        .returns(Promise.resolve(null));

      return baseReminderService.update(idToUpdate, updatedBaseReminder).should.eventually.be.false;
    });
  });

  xdescribe('The destroy function', function() {
    var row, destroy, findById;

    var idToDestroy = 1;

    before(function() {
      findById = sinon.stub(BaseReminder, 'findById');
      row = {destroy: function(){}};
      destroy = sinon.stub(row, 'destroy');
    });

    after(function() {
      findById.restore();
      destroy.restore();
    });

    it('should resolve with true when the row is destroyed', function() {
      findById.withArgs(idToDestroy)
        .returns(Promise.resolve(row));
      destroy.withArgs()
        .returns(Promise.resolve(undefined));

      return baseReminderService.destroy(idToDestroy).should.eventually.be.true;
    });

    it('should resolve with false id does not exist', function() {
      findById.withArgs(idToDestroy)
        .returns(Promise.resolve(null));

      return baseReminderService.destroy(idToDestroy).should.eventually.be.false;
    });
  });
});
