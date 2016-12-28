module.exports = function(models) {
  return {
    categories: [{
      name: 'Essays'
    }, {
      name: 'Recommendations'
    }],
    timeframes: [{
      name: 'Today',
      type: 'now'
    }, {
      name: '30 Days Before',
      type: 'relative',
      formula: '30'
    }, {
      name: 'January 1',
      type: 'absolute',
      formula: '2017-01-01'
    }],
    baseReminders: [{
      name: 'Write Essay',
      message: 'Better get writing!',
      detail: 'Some help for writing your %SCHOOL% essay for %SCHOOL%',
      lateMessage: 'Too late. Application was due on %APPLICATION_DATE%',
      lateDetail: 'Should have started sooner',
      categoryId: 1
    }, {
      name: 'Get Recommendations',
      message: 'Ask your counselor by %REMINDER_DATE%',
      detail: 'Tips for asking your counselor',
      lateMessage: 'Too late',
      lateDetail: '',
      categoryId: 2
    }],
    reminders: [{
      userId: '1',
      schoolId: '1',
      baseReminderId: '1',
      dueDate: '2016-09-01',
      timeframe: 'Today',
      isSent: false
    }, {
      userId: '1',
      schoolId: '1',
      baseReminderId: '1',
      dueDate: '2017-01-02',
      timeframe: '30 Days Before',
      isSent: false
    }, {
      userId: '1',
      schoolId: '1',
      baseReminderId: '2',
      dueDate: '2017-01-01',
      timeframe: 'January 1',
      isSent: false
    }, {
      userId: '1',
      schoolId: '2',
      baseReminderId: '1',
      dueDate: '2016-09-01',
      timeframe: 'Today',
      isSent: false
    }, {
      userId: '1',
      schoolId: '2',
      baseReminderId: '1',
      dueDate: '2017-01-02',
      timeframe: '30 Days Before',
      isSent: false
    }, {
      userId: '1',
      schoolId: '2',
      baseReminderId: '2',
      dueDate: '2017-01-01',
      timeframe: 'January 1',
      isSent: false
    }],
    schools: [{
      userId: '1',
      name: 'Temple',
      dueDate: '2017-02-01',
      isActive: true
    }, {
      userId: '1',
      name: 'Drexel',
      dueDate: '2017-02-01',
      isActive: true
    }],
    users: [{
      phoneNumber: '1234567890'
    }, {
      phoneNumber: '9876543210'
    }],
    tests: [{
      id: '1',
      type: 'SAT',
      registrationMessage: 'SAT registration message',
      registrationDetail: 'SAT registration detail',
      adminMessage: 'SAT admin message',
      adminDetail: 'SAT admin detail'
    }, {
      id: '2',
      type: 'ACT',
      registrationMessage: 'ACT registration message',
      registrationDetail: 'ACT registration detail',
      adminMessage: 'ACT admin message',
      adminDetail: 'ACT admin detail'
    }],
    testDates: [{
      testId: '1',
      registrationDate: '2017-01-01',
      adminDate: '2017-02-01',
    }, {
      testId: '2',
      registrationDate: '2017-01-15',
      adminDate: '2017-02-15'
    }],
    createMockData: function() {
      var self = this;
      return models.User.bulkCreate(self.users).then(function() {
        return models.School.bulkCreate(self.schools).then(function(){
          return models.Timeframe.bulkCreate(self.timeframes).then(function() {
            return models.Category.bulkCreate(self.categories).then(function() {
              return models.BaseReminder.create(self.baseReminders[0]).then(function(br) {
                return br.setTimeframes([1, 2]).then(function() {
                  return models.BaseReminder.create(self.baseReminders[1]).then(function(br) {
                    return br.setTimeframes([3]).then(function() {
                      return models.Reminder.bulkCreate(self.reminders).then(function() {
                        return models.Test.bulkCreate(self.tests).then(function() {
                          return models.TestDate.bulkCreate(self.testDates);
                        })
                      });
                    });
                  })
                })
              })
            })
          })
        })
      })
    }
  }
};
