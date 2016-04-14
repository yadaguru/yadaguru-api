'use strict';

var assert = require('assert');
var sinon = require('sinon');
var httpMocks = require('node-mocks-http');

var mockUserRemindersList = [{
    "timeframe": "ASAP",
    "due_date": "2020-03-11",
    "reminders": [{
        "id": "1",
        "name": "Test Reminder Number 1",
        "message": "Short reminder message",
        "detail": "Detailed reminder message",
        "lateMessage": "Short late reminder message",
        "lateDetail": "Detailed late reminder message"
    }]
}];

var mockReminder = {
    "id": "2",
    "timeframe": "By 2/1/2017",
    "name": "Test Reminder Number 2",
    "message": "Short reminder message",
    "detail": "Detailed reminder message",
    "lateMessage": "Short late reminder message",
    "lateDetail": "Detailed late reminder message"
};

var mockSchoolRemindersList = [{
    "school": "School name",
    "due_date": "2017-02-01",
    "reminder_groups": [{
    "timeframe": "Named timeframe (e.g. 'To Do Immediately', 'By 2/1/2017'",
    "due_date": "2017-02-01 (a hard date, needed for sorting)",
    "reminders": [{
      "id": "3",
      "name": "School Reminder",
      "message": "Short reminder message",
      "detail": "Detailed reminder message",
      "lateMessage": "Short late reminder message",
      "lateDetail": "Detailed late reminder message"
    }]
  }]
}];

var mockRemindersService = {
    findByUserId : function (req, res) { return  mockUserRemindersList; },
    findByIdAndUserId : function (req, res) {return mockReminder; },
    findByUserIdAndSchoolId : function (req, res) {return mockSchoolRemindersList}
}

var remindersController = require('../../controllers/remindersController.js')(mockRemindersService);

describe('Reminders Controller', function() {

    it('should return reminders assigned to the user', function() {
        var req = {};

        var res = {
            status: sinon.spy(),
            send: sinon.spy()
        };

        remindersController.getByUserId(req, res);
        assert.ok(res.status.calledWith(200));
        assert.ok(res.send.calledWith(mockUserRemindersList));
    });

    it('should return a specific reminder (if it is assigned to user in token)', function() {
        var req = {params : {notificationId : 2} };

        var res = {
            status: sinon.spy(),
            send: sinon.spy()
        };

        remindersController.getByIdAndUserId(req, res);
        assert.ok(res.status.calledWith(200));
        assert.ok(res.send.calledWith(mockReminder));
    });

    it('should return a list of reminders for a user and a specific school', function() {
        var req = {params : {schoolId : 'School name'} };

        var res = {
            status: sinon.spy(),
            send: sinon.spy()
        };

        remindersController.getByUserIdAndSchoolId(req, res);
        assert.ok(res.status.calledWith(200));
        assert.ok(res.send.calledWith(mockSchoolRemindersList));
    });
});
