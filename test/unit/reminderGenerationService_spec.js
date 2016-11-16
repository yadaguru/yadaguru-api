var sinon = require('sinon');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');
var moment = require('moment');
var Promise = require('bluebird');
chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.should();


describe('The reminderGenerationService', function() {
  var reminderGenerator, todaysDate;

  beforeEach(function() {
    reminderGenerator = require('../../services/reminderGenerationService');
    todaysDate = moment.utc('2016-09-01');
    this.clock = sinon.useFakeTimers(todaysDate.valueOf());
  });

  afterEach(function() {
    this.clock.restore();
  });

  describe('getRemindersForSchool method', function() {
    var baseReminders, timeframes, schoolId, userId, dueDate;
    var baseReminderService, findAllIncludingTimeframes;

    beforeEach(function() {
      dueDate = '2017-02-01';
      schoolId = '1';
      userId = '1';

      timeframes = {
        now: {
          id: 1,
          name: 'Today',
          type: 'now',
          formula: undefined
        },
        relative: {
          id: 2,
          name: 'In 30 Days',
          type: 'relative',
          formula: '30'
        },
        absolute: {
          id: 3,
          name: 'January 1',
          type: 'absolute',
          formula: '2017-01-01'
        }
      };

      baseReminders = [{
        id: '1',
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your essay',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        timeframes: [timeframes.now, timeframes.relative],
        categoryId: 1
      }, {
        id: '2',
        name: 'Get Recommendations',
        message: 'Ask your counselor',
        detail: 'Tips for asking your counselor',
        lateMessage: 'Too late',
        lateDetail: '',
        timeframes: [timeframes.absolute],
        categoryId: 2
      }];

      baseReminderService = require('../../services/baseReminderService');
      findAllIncludingTimeframes = sinon.stub(baseReminderService, 'findAllIncludingTimeframes');

    });

    afterEach(function() {
      findAllIncludingTimeframes.restore();
    });

    it('should generate a reminder on today\'s date if it has a timeframe type of "now"', function() {
      var baseReminder = baseReminders[0];
      baseReminder.timeframes = [timeframes.now];
      baseReminders = [baseReminder];

      findAllIncludingTimeframes.withArgs()
        .returns(Promise.resolve(baseReminders));

      var generatedReminders = [{
        schoolId: schoolId,
        userId: userId,
        baseReminderId: baseReminder.id,
        dueDate: todaysDate.format('YYYY-MM-DD'),
        timeframe: baseReminder.timeframes[0].name
      }];

      return reminderGenerator.getRemindersForSchool(schoolId, userId, dueDate)
        .should.eventually.deep.equal(generatedReminders);

    });

    it('should generate a reminder N days from the due date if it has a timeframe type of "relative"', function() {
      var baseReminder = baseReminders[0];
      baseReminder.timeframes = [timeframes.relative];
      baseReminders = [baseReminder];

      findAllIncludingTimeframes.withArgs()
        .returns(Promise.resolve(baseReminders));

      var generatedReminders =[{
        schoolId: schoolId,
        userId: userId,
        baseReminderId: baseReminder.id,
        dueDate: moment.utc(dueDate).subtract(baseReminder.timeframes[0].formula, 'Days').format('YYYY-MM-DD'),
        timeframe: baseReminder.timeframes[0].name
      }];

      return reminderGenerator.getRemindersForSchool(schoolId, userId, dueDate)
        .should.eventually.deep.equal(generatedReminders);

    });

    it('should generate a reminder on a specified date if the timeframe has a type of "absolute"', function() {
      var baseReminder = baseReminders[0];
      baseReminder.timeframes = [timeframes.absolute];
      baseReminders = [baseReminder];

      findAllIncludingTimeframes.withArgs()
        .returns(Promise.resolve(baseReminders));

      var generatedReminders = [{
        schoolId: schoolId,
        userId: userId,
        baseReminderId: baseReminder.id,
        dueDate: baseReminder.timeframes[0].formula,
        timeframe: baseReminder.timeframes[0].name
      }];

      return reminderGenerator.getRemindersForSchool(schoolId, userId, dueDate)
        .should.eventually.deep.equal(generatedReminders);
    });

    it('should generate a reminder for each timeframe associated with the baseReminder', function() {
      var baseReminder = baseReminders[0];
      baseReminder.timeframes = [timeframes.now, timeframes.relative, timeframes.absolute];
      baseReminders = [baseReminder];

      var generatedReminders = [{
        schoolId: schoolId,
        userId: userId,
        baseReminderId: baseReminder.id,
        dueDate: todaysDate.format('YYYY-MM-DD'),
        timeframe: baseReminder.timeframes[0].name
      }, {
        schoolId: schoolId,
        userId: userId,
        baseReminderId: baseReminder.id,
        dueDate: moment.utc(dueDate).subtract(baseReminder.timeframes[1].formula, 'Days').format('YYYY-MM-DD'),
        timeframe: baseReminder.timeframes[1].name
      }, {
        schoolId: schoolId,
        userId: userId,
        baseReminderId: baseReminder.id,
        dueDate: baseReminder.timeframes[2].formula,
        timeframe: baseReminder.timeframes[2].name
      }];

      findAllIncludingTimeframes.withArgs()
        .returns(Promise.resolve(baseReminders));

      return reminderGenerator.getRemindersForSchool(schoolId, userId, dueDate)
        .should.eventually.deep.equal(generatedReminders);
    });

    it('should generate reminders for each baseReminder', function() {
      var generatedReminders = [{
        schoolId: schoolId,
        userId: userId,
        baseReminderId: baseReminders[0].id,
        dueDate: todaysDate.format('YYYY-MM-DD'),
        timeframe: baseReminders[0].timeframes[0].name
      }, {
        schoolId: schoolId,
        userId: userId,
        baseReminderId: baseReminders[0].id,
        dueDate: moment.utc(dueDate).subtract(baseReminders[0].timeframes[1].formula, 'Days').format('YYYY-MM-DD'),
        timeframe: baseReminders[0].timeframes[1].name
      }, {
        schoolId: schoolId,
        userId: userId,
        baseReminderId: baseReminders[1].id,
        dueDate: baseReminders[1].timeframes[0].formula,
        timeframe: baseReminders[1].timeframes[0].name
      }];

      findAllIncludingTimeframes.withArgs()
        .returns(Promise.resolve(baseReminders));

      return reminderGenerator.getRemindersForSchool(schoolId, userId, dueDate)
        .should.eventually.deep.equal(generatedReminders);
    });
  });

  describe('the groupAndSortByDueDate function', function() {
    it('should return an array of objects containing a dueDate property, and a reminders[] property', function() {
      var input = [{
        id: '1',
        dueDate: '2017-02-06',
        timeframe: 'One day before',
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your essay',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        category: 'Essays',
        baseReminderId: '1',
        schoolId: '1',
        schoolName: 'Temple',
        schoolDueDate: '2017-02-07'
      }];

      var output = [{
        dueDate: '2017-02-06',
        reminders: [{
          id: '1',
          name: 'Write Essay',
          message: 'Better get writing!',
          detail: 'Some help for writing your essay',
          lateMessage: 'Too late',
          lateDetail: 'Should have started sooner'
        }]
      }];

      reminderGenerator.groupAndSortByDueDate(input).should.deep.equal(output);
    });

    it('should group multiple reminders into the same object if they share a due date.', function() {
      var input = [{
        id: '1',
        dueDate: '2017-02-06',
        timeframe: 'One day before',
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your essay',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        category: 'Essays',
        baseReminderId: '1',
        schoolId: '1',
        schoolName: 'Temple',
        schoolDueDate: '2017-02-07'
      }, {
        id: '2',
        dueDate: '2017-02-06',
        timeframe: 'One day before',
        name: 'Get Recommendations',
        message: 'Ask your counselor',
        detail: 'Tips for asking your counselor',
        lateMessage: 'Too late',
        lateDetail: '',
        category: 'Recommendations',
        baseReminderId: '2',
        schoolId: '1',
        schoolName: 'Temple',
        schoolDueDate: '2017-02-07'
      }];

      var output = [{
        dueDate: '2017-02-06',
        reminders: [{
          id: '1',
          name: 'Write Essay',
          message: 'Better get writing!',
          detail: 'Some help for writing your essay',
          lateMessage: 'Too late',
          lateDetail: 'Should have started sooner'
        }, {
          id: '2',
          name: 'Get Recommendations',
          message: 'Ask your counselor',
          detail: 'Tips for asking your counselor',
          lateMessage: 'Too late',
          lateDetail: ''
        }]
      }];

      reminderGenerator.groupAndSortByDueDate(input).should.deep.equal(output);
    });

    it('should return grouped reminder objects sorted by due date', function() {
      var input = [{
        id: '1',
        dueDate: '2017-02-06',
        timeframe: 'One day before',
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your essay',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        category: 'Essays',
        baseReminderId: '1',
        schoolId: '1',
        schoolName: 'Temple',
        schoolDueDate: '2017-02-07'
      }, {
        id: '2',
        dueDate: '2017-02-06',
        timeframe: 'One day before',
        name: 'Get Recommendations',
        message: 'Ask your counselor',
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
        dueDate: '2017-01-31',
        timeframe: 'One week before',
        name: 'Complete application',
        message: 'Fill it out',
        detail: 'Do not forget anything',
        lateMessage: 'You are late!',
        lateDetail: 'Whoops',
        category: 'Application',
        baseReminderId: '3',
        schoolId: '1',
        schoolName: 'Temple',
        schoolDueDate: '2017-02-07'
      }];

      var output = [{
        dueDate: '2017-01-31',
        reminders: [{
          id: '3',
          name: 'Complete application',
          message: 'Fill it out',
          detail: 'Do not forget anything',
          lateMessage: 'You are late!',
          lateDetail: 'Whoops'
        }]
      }, {
        dueDate: '2017-02-06',
        reminders: [{
          id: '1',
          name: 'Write Essay',
          message: 'Better get writing!',
          detail: 'Some help for writing your essay',
          lateMessage: 'Too late',
          lateDetail: 'Should have started sooner'
        }, {
          id: '2',
          name: 'Get Recommendations',
          message: 'Ask your counselor',
          detail: 'Tips for asking your counselor',
          lateMessage: 'Too late',
          lateDetail: ''
        }]
      }];

      reminderGenerator.groupAndSortByDueDate(input).should.deep.equal(output);
    });

    it('should group past dates into one date (yesterday)', function() {
      var input = [{
        id: '1',
        dueDate: '2016-02-06',
        timeframe: 'One day before',
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your essay',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        category: 'Essays',
        baseReminderId: '1',
        schoolId: '1',
        schoolName: 'Temple',
        schoolDueDate: '2017-02-07'
      }, {
        id: '2',
        dueDate: '2016-02-06',
        timeframe: 'One day before',
        name: 'Get Recommendations',
        message: 'Ask your counselor',
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
        dueDate: '2016-01-31',
        timeframe: 'One week before',
        name: 'Complete application',
        message: 'Fill it out',
        detail: 'Do not forget anything',
        lateMessage: 'You are late!',
        lateDetail: 'Whoops',
        category: 'Application',
        baseReminderId: '3',
        schoolId: '1',
        schoolName: 'Temple',
        schoolDueDate: '2017-02-07'
      }];

      var output = [{
        dueDate: '2016-08-31',
        reminders: [{
          id: '3',
          name: 'Complete application',
          message: 'Fill it out',
          detail: 'Do not forget anything',
          lateMessage: 'You are late!',
          lateDetail: 'Whoops'
        }, {
          id: '1',
          name: 'Write Essay',
          message: 'Better get writing!',
          detail: 'Some help for writing your essay',
          lateMessage: 'Too late',
          lateDetail: 'Should have started sooner'
        }, {
          id: '2',
          name: 'Get Recommendations',
          message: 'Ask your counselor',
          detail: 'Tips for asking your counselor',
          lateMessage: 'Too late',
          lateDetail: ''
        }]
      }];

      reminderGenerator.groupAndSortByDueDate(input).should.deep.equal(output);
    });

    it('can also handle grouping of testDate reminders', function() {
      var input = [{
        dueDate: '2017-01-01',
        id: '3',
        name: 'ACT registration due today',
        message: 'A message about registering',
        detail: 'Some details',
        registrationDate: '2017-01-01',
        adminDate: '2017-02-01'
      }, {
        dueDate: '2017-01-01',
        id: '4',
        name: 'ACT registration due today',
        message: 'A message about registering',
        detail: 'Some details',
        registrationDate: '2017-01-15',
        adminDate: '2017-02-15'
      }, {
        dueDate: '2017-02-01',
        id: '3',
        name: 'ACT test today',
        message: 'A message about the test',
        detail: 'Some details',
        registrationDate: '2017-01-01',
        adminDate: '2017-02-01'
      }, {
        dueDate: '2017-02-01',
        id: '4',
        name: 'ACT test today',
        message: 'A message about the test',
        detail: 'Some details',
        registrationDate: '2017-01-15',
        adminDate: '2017-02-15'
      }];

      var output = [{
        dueDate: '2017-01-01',
        reminders: [{
          id: '3',
          name: 'ACT registration due today',
          message: 'A message about registering',
          detail: 'Some details',
          lateMessage: '',
          lateDetail: ''
        }, {
          id: '4',
          name: 'ACT registration due today',
          message: 'A message about registering',
          detail: 'Some details',
          lateMessage: '',
          lateDetail: ''
        }]
      }, {
        dueDate: '2017-02-01',
        reminders: [{
          id: '3',
          name: 'ACT test today',
          message: 'A message about the test',
          detail: 'Some details',
          lateMessage: '',
          lateDetail: ''
        }, {
          id: '4',
          name: 'ACT test today',
          message: 'A message about the test',
          detail: 'Some details',
          lateMessage: '',
          lateDetail: ''
        }]
      }];

      reminderGenerator.groupAndSortByDueDate(input).should.deep.equal(output);
    });
  });

  describe('the replaceVariablesInReminders function', function() {
    it('should replace all variables in the message, detail, lateMessage, and lateDetail fields with their mapped values', function() {
      var input = [{
        id: '1',
        dueDate: '2017-02-06',
        timeframe: 'One day before',
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your %SCHOOL% essay for %SCHOOL%',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        category: 'Essays',
        baseReminderId: '1',
        schoolId: '1',
        schoolName: 'Temple',
        schoolDueDate: '2017-02-07'
      }, {
        id: '2',
        dueDate: '2017-02-06',
        timeframe: 'One day before',
        name: 'Get Recommendations',
        message: 'Ask your counselor by %REMINDER_DATE%',
        detail: 'Tips for asking your counselor',
        lateMessage: 'Too late. It is past %APPLICATION_DATE%',
        lateDetail: '',
        category: 'Recommendations',
        baseReminderId: '2',
        schoolId: '1',
        schoolName: 'Temple',
        schoolDueDate: '2017-02-07'
      }];

      var output = [{
        id: '1',
        dueDate: '2017-02-06',
        timeframe: 'One day before',
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your Temple essay for Temple',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        category: 'Essays',
        baseReminderId: '1',
        schoolId: '1',
        schoolName: 'Temple',
        schoolDueDate: '2017-02-07'
      }, {
        id: '2',
        dueDate: '2017-02-06',
        timeframe: 'One day before',
        name: 'Get Recommendations',
        message: 'Ask your counselor by 2/6/2017',
        detail: 'Tips for asking your counselor',
        lateMessage: 'Too late. It is past 2/7/2017',
        lateDetail: '',
        category: 'Recommendations',
        baseReminderId: '2',
        schoolId: '1',
        schoolName: 'Temple',
        schoolDueDate: '2017-02-07'
      }];

      reminderGenerator.replaceVariablesInReminders(input).should.deep.equal(output);
    });

    it('should return the same string if no variables are found', function() {
      var input = [{
        id: '1',
        dueDate: '2017-02-06',
        timeframe: 'One day before',
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your essay',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        category: 'Essays',
        baseReminderId: '1',
        schoolId: '1',
        schoolName: 'Temple',
        schoolDueDate: '2017-02-07'
      }, {
        id: '2',
        dueDate: '2017-02-06',
        timeframe: 'One day before',
        name: 'Get Recommendations',
        message: 'Ask your counselor',
        detail: 'Tips for asking your counselor',
        lateMessage: 'Too late',
        lateDetail: '',
        category: 'Recommendations',
        baseReminderId: '1',
        schoolId: '1',
        schoolName: 'Temple',
        schoolDueDate: '2017-02-07'
      }];

      reminderGenerator.replaceVariablesInReminders(input).should.deep.equal(input);
    });

    it('it should not do the replacement if the reminder does not have data for the field available', function() {
      var input = [{
        id: '1',
        dueDate: '2017-02-06',
        timeframe: 'One day before',
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your %SCHOOL% essay for %SCHOOL%',
        lateMessage: 'Too late it is %ADMIN_DATE%',
        lateDetail: 'Should have started sooner',
        category: 'Essays',
        baseReminderId: '1',
        schoolId: '1',
        schoolName: 'Temple',
        schoolDueDate: '2017-02-07'
      }, {
        dueDate: '2017-02-01',
        id: '3',
        name: 'ACT test today',
        message: 'A message about the test on %ADMIN_DATE%',
        detail: 'Some details about %SCHOOL%',
        registrationDate: '2017-01-01',
        adminDate: '2017-02-01'
      }];

      var output = [{
        id: '1',
        dueDate: '2017-02-06',
        timeframe: 'One day before',
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your Temple essay for Temple',
        lateMessage: 'Too late it is %ADMIN_DATE%',
        lateDetail: 'Should have started sooner',
        category: 'Essays',
        baseReminderId: '1',
        schoolId: '1',
        schoolName: 'Temple',
        schoolDueDate: '2017-02-07'
      }, {
        dueDate: '2017-02-01',
        id: '3',
        name: 'ACT test today',
        message: 'A message about the test on 2/1/2017',
        detail: 'Some details about %SCHOOL%',
        registrationDate: '2017-01-01',
        adminDate: '2017-02-01'
      }];

      reminderGenerator.replaceVariablesInReminders(input).should.deep.equal(output);
    });
  });

  describe('the deDuplicateReminders function', function() {
    it('should combine reminders having the same baseReminder ID and dueDate when their schoolID is different', function() {
      var input = [{
        id: '1',
        dueDate: '2017-02-06',
        timeframe: 'One day before',
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your %SCHOOL% essay for %SCHOOL%',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        category: 'Essays',
        baseReminderId: '1',
        schoolId: '1',
        schoolName: 'Temple',
        schoolDueDate: '2017-02-07'
      }, {
        id: '2',
        dueDate: '2017-02-06',
        timeframe: 'One day before',
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your %SCHOOL% essay for %SCHOOL%',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        category: 'Essays',
        baseReminderId: '1',
        schoolId: '2',
        schoolName: 'Drexel',
        schoolDueDate: '2017-02-07'
      }];

      var output = [{
        id: ['1', '2'],
        dueDate: '2017-02-06',
        timeframe: 'One day before',
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your %SCHOOL% essay for %SCHOOL%',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        category: 'Essays',
        baseReminderId: '1',
        schoolId: ['1', '2'],
        schoolName: 'Temple and Drexel',
        schoolDueDate: '2017-02-07'
      }];

      reminderGenerator.deDuplicateReminders(input).should.deep.equal(output);
    });

    it('should combine 3 or more school Names with the format School 1, School 2, and School 3', function() {
      var input = [{
        id: '1',
        dueDate: '2017-02-06',
        timeframe: 'One day before',
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your %SCHOOL% essay for %SCHOOL%',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        category: 'Essays',
        baseReminderId: '1',
        schoolId: '1',
        schoolName: 'Temple',
        schoolDueDate: '2017-02-07'
      }, {
        id: '2',
        dueDate: '2017-02-06',
        timeframe: 'One day before',
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your %SCHOOL% essay for %SCHOOL%',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        category: 'Essays',
        baseReminderId: '1',
        schoolId: '2',
        schoolName: 'Drexel',
        schoolDueDate: '2017-02-07'
      }, {
        id: '3',
        dueDate: '2017-02-06',
        timeframe: 'One day before',
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your %SCHOOL% essay for %SCHOOL%',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        category: 'Essays',
        baseReminderId: '1',
        schoolId: '3',
        schoolName: 'Penn',
        schoolDueDate: '2017-02-07'
      }];

      var output = [{
        id: ['1', '2', '3'],
        dueDate: '2017-02-06',
        timeframe: 'One day before',
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your %SCHOOL% essay for %SCHOOL%',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        category: 'Essays',
        baseReminderId: '1',
        schoolId: ['1', '2', '3'],
        schoolName: 'Temple, Drexel, and Penn',
        schoolDueDate: '2017-02-07'
      }];

      reminderGenerator.deDuplicateReminders(input).should.deep.equal(output);
    });

    it('should not combine schools if the baseReminder does not match', function() {
      var input = [{
        id: '1',
        dueDate: '2017-02-06',
        timeframe: 'One day before',
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your %SCHOOL% essay for %SCHOOL%',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        category: 'Essays',
        baseReminderId: '1',
        schoolId: '1',
        schoolName: 'Temple',
        schoolDueDate: '2017-02-07'
      }, {
        id: '2',
        dueDate: '2017-02-06',
        timeframe: 'One day before',
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your %SCHOOL% essay for %SCHOOL%',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        category: 'Essays',
        baseReminderId: '1',
        schoolId: '2',
        schoolName: 'Drexel',
        schoolDueDate: '2017-02-07'
      }, {
        id: '3',
        dueDate: '2017-02-06',
        timeframe: 'One day before',
        name: 'Get Recommendations',
        message: 'Ask your counselor',
        detail: 'Tips for asking your counselor',
        lateMessage: 'Too late',
        lateDetail: '',
        category: 'Recommendations',
        baseReminderId: '2',
        schoolId: '3',
        schoolName: 'Penn',
        schoolDueDate: '2017-02-07'
      }];

      var output = [{
        id: ['1', '2'],
        dueDate: '2017-02-06',
        timeframe: 'One day before',
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your %SCHOOL% essay for %SCHOOL%',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        category: 'Essays',
        baseReminderId: '1',
        schoolId: ['1', '2'],
        schoolName: 'Temple and Drexel',
        schoolDueDate: '2017-02-07'
      }, {
        id: '3',
        dueDate: '2017-02-06',
        timeframe: 'One day before',
        name: 'Get Recommendations',
        message: 'Ask your counselor',
        detail: 'Tips for asking your counselor',
        lateMessage: 'Too late',
        lateDetail: '',
        category: 'Recommendations',
        baseReminderId: '2',
        schoolId: '3',
        schoolName: 'Penn',
        schoolDueDate: '2017-02-07'
      }];

      reminderGenerator.deDuplicateReminders(input).should.deep.equal(output);
    });

    it('should not combine schools if the dueDate does not match', function() {
      var input = [{
        id: '1',
        dueDate: '2017-02-06',
        timeframe: 'One day before',
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your %SCHOOL% essay for %SCHOOL%',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        category: 'Essays',
        baseReminderId: '1',
        schoolId: '1',
        schoolName: 'Temple',
        schoolDueDate: '2017-02-07'
      }, {
        id: '2',
        dueDate: '2017-02-06',
        timeframe: 'One day before',
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your %SCHOOL% essay for %SCHOOL%',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        category: 'Essays',
        baseReminderId: '1',
        schoolId: '2',
        schoolName: 'Drexel',
        schoolDueDate: '2017-02-07'
      }, {
        id: '3',
        dueDate: '2017-02-07',
        timeframe: 'One day before',
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your %SCHOOL% essay for %SCHOOL%',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        category: 'Essays',
        baseReminderId: '1',
        schoolId: '3',
        schoolName: 'Penn',
        schoolDueDate: '2017-02-08'
      }];

      var output = [{
        id: ['1', '2'],
        dueDate: '2017-02-06',
        timeframe: 'One day before',
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your %SCHOOL% essay for %SCHOOL%',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        category: 'Essays',
        baseReminderId: '1',
        schoolId: ['1', '2'],
        schoolName: 'Temple and Drexel',
        schoolDueDate: '2017-02-07'
      }, {
        id: '3',
        dueDate: '2017-02-07',
        timeframe: 'One day before',
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your %SCHOOL% essay for %SCHOOL%',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        category: 'Essays',
        baseReminderId: '1',
        schoolId: '3',
        schoolName: 'Penn',
        schoolDueDate: '2017-02-08'
      }];

      reminderGenerator.deDuplicateReminders(input).should.deep.equal(output);
    });

    it('should still work if reminders are not in order', function() {
      var input = [{
        id: '1',
        dueDate: '2017-02-06',
        timeframe: 'One day before',
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your %SCHOOL% essay for %SCHOOL%',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        category: 'Essays',
        baseReminderId: '1',
        schoolId: '1',
        schoolName: 'Temple',
        schoolDueDate: '2017-02-07'
      }, {
        id: '3',
        dueDate: '2017-02-06',
        timeframe: 'One day before',
        name: 'Get Recommendations',
        message: 'Ask your counselor',
        detail: 'Tips for asking your counselor',
        lateMessage: 'Too late',
        lateDetail: '',
        category: 'Recommendations',
        baseReminderId: '2',
        schoolId: '3',
        schoolName: 'Penn',
        schoolDueDate: '2017-02-07'
      }, {
        id: '2',
        dueDate: '2017-02-06',
        timeframe: 'One day before',
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your %SCHOOL% essay for %SCHOOL%',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        category: 'Essays',
        baseReminderId: '1',
        schoolId: '2',
        schoolName: 'Drexel',
        schoolDueDate: '2017-02-07'
      }];

      var output = [{
        id: ['1', '2'],
        dueDate: '2017-02-06',
        timeframe: 'One day before',
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your %SCHOOL% essay for %SCHOOL%',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        category: 'Essays',
        baseReminderId: '1',
        schoolId: ['1', '2'],
        schoolName: 'Temple and Drexel',
        schoolDueDate: '2017-02-07'
      }, {
        id: '3',
        dueDate: '2017-02-06',
        timeframe: 'One day before',
        name: 'Get Recommendations',
        message: 'Ask your counselor',
        detail: 'Tips for asking your counselor',
        lateMessage: 'Too late',
        lateDetail: '',
        category: 'Recommendations',
        baseReminderId: '2',
        schoolId: '3',
        schoolName: 'Penn',
        schoolDueDate: '2017-02-07'
      }];

      reminderGenerator.deDuplicateReminders(input).should.deep.equal(output);
    });
  });

  describe('the getTestReminders function', function() {
    var findAll, serviceResponse;
    var testDateService = require('../../services/testDateService');

    beforeEach(function() {
      findAll = sinon.stub(testDateService, 'findAll');
      serviceResponse = [{
        id: '1',
        testId: '1',
        registrationDate: '2016-09-01',
        adminDate: '2016-10-01',
        type: 'SAT',
        registrationMessage: 'A message about registering',
        registrationDetail: 'Some details',
        adminMessage: 'A message about the test',
        adminDetail: 'Some details'
      }, {
        id: '2',
        testId: '1',
        registrationDate: '2016-09-15',
        adminDate: '2016-10-15',
        type: 'SAT',
        registrationMessage: 'A message about registering',
        registrationDetail: 'Some details',
        adminMessage: 'A message about the test',
        adminDetail: 'Some details'
      }, {
        id: '3',
        testId: '2',
        registrationDate: '2017-01-01',
        adminDate: '2017-02-01',
        type: 'ACT',
        registrationMessage: 'A message about registering',
        registrationDetail: 'Some details',
        adminMessage: 'A message about the test',
        adminDetail: 'Some details'
      }, {
        id: '4',
        testId: '2',
        registrationDate: '2017-01-15',
        adminDate: '2017-02-15',
        type: 'ACT',
        registrationMessage: 'A message about registering',
        registrationDetail: 'Some details',
        adminMessage: 'A message about the test',
        adminDetail: 'Some details'
      }];
    });

    afterEach(function() {
      findAll.restore();
    });

    it('should return test reminders, split into admin and registration dates, from the current date forward', function() {
      findAll.withArgs()
        .returns(Promise.resolve(serviceResponse));

      var expectedResponse = [{
        dueDate: '2016-10-01',
        id: '1',
        name: 'SAT test today',
        message: 'A message about the test',
        detail: 'Some details',
        registrationDate: '2016-09-01',
        adminDate: '2016-10-01'
      }, {
        dueDate: '2016-10-15',
        id: '2',
        name: 'SAT test today',
        message: 'A message about the test',
        detail: 'Some details',
        registrationDate: '2016-09-15',
        adminDate: '2016-10-15'
      }, {
        dueDate: '2017-01-01',
        id: '3',
        name: 'ACT registration due today',
        message: 'A message about registering',
        detail: 'Some details',
        registrationDate: '2017-01-01',
        adminDate: '2017-02-01'
      }, {
        dueDate: '2017-01-15',
        id: '4',
        name: 'ACT registration due today',
        message: 'A message about registering',
        detail: 'Some details',
        registrationDate: '2017-01-15',
        adminDate: '2017-02-15'
      }, {
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

      return reminderGenerator.getTestReminders(moment.utc('2016-10-01'))
        .should.eventually.deep.equal(expectedResponse);
    });
  })
});

