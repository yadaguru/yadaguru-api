var sinon = require('sinon');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');
chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.should();

var models = require('../../models');
var Reminder = models.Reminder;
var BaseReminder = models.BaseReminder;
var Category = models.Category;
var School = models.School;
var reminderService = require('../../services/reminderService');

describe('The Reminders Service', function() {
  var dbResponse = [{
    dataValues: {
      id: '1',
      dueDate: '2017-02-01',
      timeframe: 'One week before',
      BaseReminder: {
        dataValues: {
          id: '1',
          name: 'Write Essay',
          message: 'Better get writing!',
          detail: 'Some help for writing your essay',
          lateMessage: 'Too late',
          lateDetail: 'Should have started sooner',
          categoryId: 1,
          Category: {
            dataValues: {
              id: 1,
              name: 'Essays'
            }
          }
        }
      },
      School: {
        dataValues: {
          id: '1',
          name: 'Temple',
          dueDate: '2017-02-01'
        }
      }
    }
  }, {
    dataValues: {
      id: '2',
      dueDate: '2017-02-01',
      timeframe: 'One week before',
      BaseReminder: {
        dataValues: {
          id: '2',
          name: 'Get Recommendations',
          message: 'Ask your counselor',
          detail: 'Tips for asking your counselor',
          lateMessage: 'Too late',
          lateDetail: '',
          categoryId: '2',
          Category: {
            dataValues: {
              id: '2',
              name: 'Recommendations'
            }
          }
        }
      },
      School: {
        dataValues: {
          id: '1',
          name: 'Temple',
          dueDate: '2017-02-01'
        }
      }
    }
  }];

  var returnedResult = [{
    id: '1',
    dueDate: '2017-02-01',
    timeframe: 'One week before',
    name: 'Write Essay',
    message: 'Better get writing!',
    detail: 'Some help for writing your essay',
    lateMessage: 'Too late',
    lateDetail: 'Should have started sooner',
    category: 'Essays',
    baseReminderId: '1',
    schoolName: 'Temple',
    schoolId: '1',
    schoolDueDate: '2017-02-01'
  }, {
    id: '2',
    dueDate: '2017-02-01',
    timeframe: 'One week before',
    name: 'Get Recommendations',
    message: 'Ask your counselor',
    detail: 'Tips for asking your counselor',
    lateMessage: 'Too late',
    lateDetail: '',
    category: 'Recommendations',
    baseReminderId: '2',
    schoolName: 'Temple',
    schoolId: '1',
    schoolDueDate: '2017-02-01'
  }];

  var reminders =[{
    id: '1',
    userId: '1',
    schoolId: '1',
    baseReminderId: '1',
    dueDate: '2017-02-01',
    timeframe: 'One week before'
  }, {
    id: '2',
    userId: '1',
    schoolId: '1',
    baseReminderId: '2',
    dueDate: '2017-02-01',
    timeframe: 'One week before'
  }];

  describe('The findByUserWithBaseReminders function', function() {
    var findAll;

    beforeEach(function() {
      findAll = sinon.stub(Reminder, 'findAll')
    });

    afterEach(function() {
      findAll.restore();
    });

    it('should resolve with a flattened array of reminders joined with base reminders, joined with categories', function() {
      findAll.withArgs({
          where: {
            userId: 1
          },
          include: [{
            model: BaseReminder,
            include: {
              model: Category
            }
          }, {
            model: School
          }]
      }).returns(Promise.resolve(dbResponse));

      return reminderService.findByUserWithBaseReminders(1).should.eventually.deep.equal(returnedResult);
    });

    it('should resolve with an empty array there are no reminders', function() {
      findAll.returns(Promise.resolve([]));

      return reminderService.findByUserWithBaseReminders(1).should.eventually.deep.equal([]);
    });
  });

  describe('The findByUserForSchoolWithBaseReminders function', function() {
    var findAll;

    beforeEach(function() {
      findAll = sinon.stub(Reminder, 'findAll')
    });

    afterEach(function() {
      findAll.restore();
    });

    it('should resolve with a flattened array of reminders for a school, joined with base reminders, joined with categories', function() {
      findAll.withArgs({
        where: {
          userId: 1,
          schoolId: 1
        },
        include: [{
          model: BaseReminder,
          include: {
            model: Category
          }
        }, {
          model: School
        }]
      }).returns(Promise.resolve(dbResponse));

      return reminderService.findByUserForSchoolWithBaseReminders(1, 1).should.eventually.deep.equal(returnedResult);
    });

    it('should resolve with an empty array there are no reminders', function() {
      findAll.returns(Promise.resolve([]));

      return reminderService.findByUserForSchoolWithBaseReminders().should.eventually.deep.equal([]);
    });
  });

  describe('The findByIdForUserWithBaseReminders function', function() {
    var findAll;

    beforeEach(function() {
      findAll = sinon.stub(Reminder, 'findAll')
    });

    afterEach(function() {
      findAll.restore();
    });

    it('should resolve with a flattened array of reminder matching the id, joined with base reminders, joined with categories', function() {
      findAll.withArgs({
        where: {
          id: 1,
          userId: 1
        },
        include: [{
          model: BaseReminder,
          include: {
            model: Category
          }
        }, {
          model: School
        }]
      }).returns(Promise.resolve([dbResponse[0]]));

      return reminderService.findByIdForUserWithBaseReminders(1, 1).should.eventually.deep.equal([returnedResult[0]]);
    });

    it('should resolve with an empty array there are no reminders', function() {
      findAll.returns(Promise.resolve([]));

      return reminderService.findByIdForUserWithBaseReminders(1).should.eventually.deep.equal([]);
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
