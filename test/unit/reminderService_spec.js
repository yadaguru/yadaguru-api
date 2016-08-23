var sinon = require('sinon');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');
chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.should();

var models = require('../../models');
var Reminder = models.Reminder;
var reminderService = require('../../services/reminderService');

describe('The Reminders Service', function() {
  var reminders =[{
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

  describe('The findByUser function', function() {
    var findAll;

    before(function() {
      findAll = sinon.stub(Reminder, 'findAll');
    });

    after(function() {
      findAll.restore();
    });

    it('should resolve with an array of objects representing reminders', function() {
      findAll.returns(Promise.resolve(reminders.map(
        function(reminder) {
          return {dataValues: reminder};
        }
      )));

      return reminderService.findByUser(1).should.eventually.deep.equal(reminders);
    });

    it('should resolve with an empty array there are no reminders', function() {
      findAll.returns(Promise.resolve([]));

      return reminderService.findAll().should.eventually.deep.equal([]);
    });
  });

  describe('The findBySchool function', function() {
    var findAll;

    before(function() {
      findAll = sinon.stub(Reminder, 'findAll');
    });

    after(function() {
      findAll.restore();
    });

    it('should resolve with an array of objects representing reminders', function() {
      findAll.returns(Promise.resolve(reminders.map(
        function(reminder) {
          return {dataValues: reminder};
        }
      )));

      return reminderService.findBySchool(1).should.eventually.deep.equal(reminders);
    });

    it('should resolve with an empty array there are no reminders', function() {
      findAll.returns(Promise.resolve([]));

      return reminderService.findAll().should.eventually.deep.equal([]);
    });
  });

  describe('The findById function', function() {
    var findById;

    before(function() {
      findById = sinon.stub(Reminder, 'findById');
    });

    after(function() {
      findById.restore();
    });

    it('should resolve with an array with the matching reminder object', function() {
      findById.withArgs(1)
        .returns(Promise.resolve({dataValues: reminders[0]}));

      return reminderService.findById(1).should.eventually.deep.equal([reminders[0]]);
    });

    it('should resolve with an empty array if no reminders were found', function() {
      findById.withArgs(3)
        .returns(Promise.resolve(null));

      return reminderService.findById(3).should.eventually.deep.equal([]);
    });
  });

  describe('The bulk create function', function() {
    var bulkCreate;

    var newReminders = reminders;

    before(function() {
      bulkCreate = sinon.stub(Reminder, 'bulkCreate');
    });

    after(function() {
      bulkCreate.restore();
    });

    it('should resolve with the count of newly-inserted reminder objects', function() {
      bulkCreate.returns(Promise.resolve(newReminders));

      return reminderService.bulkCreate(newReminders).should.eventually.equal(2);
    });
  });

});
