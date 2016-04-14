'use strict';

var assert = require('assert');
var sinon = require('sinon');
var httpMocks = require('node-mocks-http');

var mockBaseReminders = [
  {
    id: 1,
    name: 'A reminder',
    message: 'A message',
    detail: 'Some details',
    lateMessage: 'A late message',
    lateDetail: 'Some late details',
    timeframes: [1, 2],
    category: 1
  },
  {
    id: 2,
    name: 'Another reminder',
    message: 'Another message',
    detail: 'Some more details',
    lateMessage: 'Another late message',
    lateDetail: 'Some more late details',
    timeframes: [3, 4, 5],
    category: 2
  }
];

var mockBaseReminderService = {

  create: function(data) {
    mockBaseReminders.push({
      id: 3,
      name: data.name,
      message: data.message,
      detail: data.detail,
      lateMessage: data.lateMessage,
      lateDetail: data.lateDetail,
      timeframes: data.timeframes,
      category: data.category
    });
    return mockBaseReminders;
  },
  findAll: function() {
    return mockBaseReminders;
  },
  findOne: function(id) {
    return [mockBaseReminders[id - 1]];
  },
  update: function(id, data) {
    var mockBaseReminder = mockBaseReminders[id - 1];
    mockBaseReminder.name = data.name;
    mockBaseReminder.message = data.message;
    mockBaseReminder.detail = data.detail;
    mockBaseReminder.lateMessage = data.lateMessage;
    mockBaseReminder.lateDetail = data.lateDetail;
    mockBaseReminder.timeframes = data.timeframes;
    mockBaseReminder.category = data.category;
    mockBaseReminders[id - 1] = mockBaseReminder;
    return mockBaseReminders;
  },
  destroy: function(id) {
    mockBaseReminders.splice(id - 1, 1);
    return mockBaseReminders;
  }

};

var baseRemindersController = require('../../controllers/baseRemindersController.js')(mockBaseReminderService);

describe('BaseReminders Controller', function() {

  it('should return an array of all BaseReminders when calling getAll', function() {

    var req = {};

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    baseRemindersController.getAll(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([
      {
        id: 1,
        name: 'A reminder',
        message: 'A message',
        detail: 'Some details',
        lateMessage: 'A late message',
        lateDetail: 'Some late details',
        timeframes: [1, 2],
        category: 1
      },
      {
        id: 2,
        name: 'Another reminder',
        message: 'Another message',
        detail: 'Some more details',
        lateMessage: 'Another late message',
        lateDetail: 'Some more late details',
        timeframes: [3, 4, 5],
        category: 2
      }
    ]));

  });

  it('should return an array of one matching BaseReminders when calling getOne with an id', function() {

    var req ={
      params: {
        id: 1
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    baseRemindersController.getOne(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([
      {
        id: 1,
        name: 'A reminder',
        message: 'A message',
        detail: 'Some details',
        lateMessage: 'A late message',
        lateDetail: 'Some late details',
        timeframes: [1, 2],
        category: 1
      }
    ]));

  });

  it ('should return an array of all BaseReminders including the new one when posting a new baseReminder', function() {

    var req = {
      body: {
        name: 'A 3rd reminder',
        message: 'A 3rd message',
        detail: 'Yet more details',
        lateMessage: 'Yet another late message',
        lateDetail: 'Some more late details',
        timeframes: [5],
        category: 3
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    baseRemindersController.post(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([
      {
        id: 1,
        name: 'A reminder',
        message: 'A message',
        detail: 'Some details',
        lateMessage: 'A late message',
        lateDetail: 'Some late details',
        timeframes: [1, 2],
        category: 1
      },
      {
        id: 2,
        name: 'Another reminder',
        message: 'Another message',
        detail: 'Some more details',
        lateMessage: 'Another late message',
        lateDetail: 'Some more late details',
        timeframes: [3, 4, 5],
        category: 2
      },
      {
        id: 3,
        name: 'A 3rd reminder',
        message: 'A 3rd message',
        detail: 'Yet more details',
        lateMessage: 'Yet another late message',
        lateDetail: 'Some more late details',
        timeframes: [5],
        category: 3
      }
    ]));

  });

  it ('should return an array of all BaseReminders with updated data when updating a baseReminder', function() {

    var req = {
      body: {
        name: 'We changed the category',
        message: 'A 3rd message',
        detail: 'Yet more details',
        lateMessage: 'Yet another late message',
        lateDetail: 'Some more late details',
        timeframes: [5],
        category: 4
      },
      params: {
        id: 3
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    baseRemindersController.put(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([
      {
        id: 1,
        name: 'A reminder',
        message: 'A message',
        detail: 'Some details',
        lateMessage: 'A late message',
        lateDetail: 'Some late details',
        timeframes: [1, 2],
        category: 1
      },
      {
        id: 2,
        name: 'Another reminder',
        message: 'Another message',
        detail: 'Some more details',
        lateMessage: 'Another late message',
        lateDetail: 'Some more late details',
        timeframes: [3, 4, 5],
        category: 2
      },
      {
        id: 3,
        name: 'We changed the category',
        message: 'A 3rd message',
        detail: 'Yet more details',
        lateMessage: 'Yet another late message',
        lateDetail: 'Some more late details',
        timeframes: [5],
        category: 4
      }
    ]));


  });

  it ('should return an array of all BaseReminders without the deleted baseReminder when deleting a baseReminder', function() {

    var req = {
      params: {
        id: 1
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    baseRemindersController.del(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([
      {
        id: 2,
        name: 'Another reminder',
        message: 'Another message',
        detail: 'Some more details',
        lateMessage: 'Another late message',
        lateDetail: 'Some more late details',
        timeframes: [3, 4, 5],
        category: 2
      },
      {
        id: 3,
        name: 'We changed the category',
        message: 'A 3rd message',
        detail: 'Yet more details',
        lateMessage: 'Yet another late message',
        lateDetail: 'Some more late details',
        timeframes: [5],
        category: 4
      }
    ]));

  });

});

