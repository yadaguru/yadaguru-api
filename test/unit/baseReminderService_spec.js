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

    afterEach(function() {
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

  describe('The update function', function() {
    var findById, update, setTimeframes, getTimeframes, associatedTimeframes, baseReminder,
        updatedBaseReminderDbResponse, updatedTimeframeAssociations;

    var updatedBaseReminder = {
      name: 'Write Essays',
      message: 'Write Your Essays',
      detail: 'More detail about essays',
      lateMessage: 'Your Essays are late',
      lateDetail: 'What to do about late essays',
      categoryId: 1,
      timeframeIds: [1, 2]
    };

    var updatedBaseReminderNoTimeframes = {
      name: 'Write Essays',
      message: 'Write Your Essays',
      detail: 'More detail about essays',
      lateMessage: 'Your Essays are late',
      lateDetail: 'What to do about late essays',
      categoryId: 1
    };

    beforeEach(function() {
      updatedBaseReminderDbResponse = {
        dataValues: {
          name: 'Write Essays',
          message: 'Write Your Essays',
          detail: 'More detail about essays',
          lateMessage: 'Your Essays are late',
          lateDetail: 'What to do about late essays',
          categoryId: 1
        },
        setTimeframes: function(){},
        getTimeframes: function(){}
      };

      updatedTimeframeAssociations = [[{
        dataValues: {
          TimeframeId: 1
        }
      }, {
        dataValues: {
          TimeframeId: 2
        }
      }]];

      associatedTimeframes = [{
        dataValues: {
          id: 1
        }}, {
        dataValues: {
          id: 2
        }
      }];

      baseReminder = {
        update: function(){}
      };


      findById = sinon.stub(BaseReminder, 'findById');
      update = sinon.stub(baseReminder, 'update');
      setTimeframes = sinon.stub(updatedBaseReminderDbResponse, 'setTimeframes');
      getTimeframes = sinon.stub(updatedBaseReminderDbResponse, 'getTimeframes');
    });

    afterEach(function() {
      updatedBaseReminderDbResponse = undefined;
      updatedTimeframeAssociations = undefined;
      findById.restore();
      update.restore();
      setTimeframes.restore();
      getTimeframes.restore();
    });

    it('should resolve with an array containing the updated baseReminder object', function() {
      findById.returns(Promise.resolve(baseReminder));
      update.returns(Promise.resolve(updatedBaseReminderDbResponse));
      setTimeframes.returns(Promise.resolve(updatedTimeframeAssociations));

      return baseReminderService.update(1, updatedBaseReminder).should.eventually.deep.equal([updatedBaseReminder]);
    });

    it('should resolve with an array containing the updated baseReminder object, even if timeframes are not updated', function() {
      findById.returns(Promise.resolve(baseReminder));
      update.returns(Promise.resolve(updatedBaseReminderDbResponse));
      getTimeframes.returns(Promise.resolve(associatedTimeframes));

      return baseReminderService.update(1, updatedBaseReminderNoTimeframes).should.eventually.deep.equal([updatedBaseReminder]);
    });

    it('should resolve with false if the id does not exist', function() {
      findById.returns(Promise.resolve(null));

      return baseReminderService.update(1, updatedBaseReminder).should.eventually.be.false;
    });
  });

  describe('The destroy function', function() {
    var baseReminder, destroy, findById, setTimeframes;

    beforeEach(function() {
      findById = sinon.stub(BaseReminder, 'findById');
      baseReminder = {
        destroy: function(){},
        setTimeframes: function(){}
      };
      destroy = sinon.stub(baseReminder, 'destroy');
      setTimeframes = sinon.stub(baseReminder, 'setTimeframes')
    });

    afterEach(function() {
      findById.restore();
      destroy.restore();
      setTimeframes.restore();
    });

    it('should resolve with true when the row is destroyed', function() {
      findById.returns(Promise.resolve(baseReminder));
      setTimeframes.returns(Promise.resolve());
      destroy.returns(Promise.resolve(undefined));

      return baseReminderService.destroy(1).should.eventually.be.true;
    });

    it('should resolve with false id does not exist', function() {
      findById.returns(Promise.resolve(null));

      return baseReminderService.destroy(1).should.eventually.be.false;
    });
  });
});
