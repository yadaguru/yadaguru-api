'use strict';

var assert = require('assert');
var sinon = require('sinon');

var httpResponseService = require('../../services/httpResponseService');

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
    var _mockBaseReminders = JSON.parse(JSON.stringify(mockBaseReminders));
    _mockBaseReminders.push({
      id: 3,
      name: data.name,
      message: data.message,
      detail: data.detail,
      lateMessage: data.lateMessage || '',
      lateDetail: data.lateDetail || '',
      timeframes: data.timeframes,
      category: data.category
    });
    return _mockBaseReminders;
  },
  findAll: function() {
    return mockBaseReminders;
  },
  findOne: function(id) {
    return [mockBaseReminders[id - 1]];
  },
  update: function(id, data) {
    var _mockBaseReminders = JSON.parse(JSON.stringify(mockBaseReminders));
    var mockBaseReminder = _mockBaseReminders[id - 1];
    mockBaseReminder.name = data.name;
    mockBaseReminder.message = data.message;
    mockBaseReminder.detail = data.detail;
    mockBaseReminder.lateMessage = data.lateMessage;
    mockBaseReminder.lateDetail = data.lateDetail;
    mockBaseReminder.timeframes = data.timeframes;
    mockBaseReminder.category = data.category;
    _mockBaseReminders[id - 1] = mockBaseReminder;
    return _mockBaseReminders;
  },
  destroy: function(id) {
    var _mockBaseReminders = JSON.parse(JSON.stringify(mockBaseReminders));
    _mockBaseReminders.splice(id - 1, 1);
    return _mockBaseReminders;
  }

};

var baseRemindersController = require('../../controllers/baseRemindersController.js')(mockBaseReminderService, httpResponseService());

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

    var req = {
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

  it('should return an array of all BaseReminders including the new one when posting a new baseReminder', function() {

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

  it('should accept a request with optional items when creating a new baseReminder', function() {

    var req = {
      body: {
        name: 'A 3rd reminder',
        message: 'A 3rd message',
        detail: 'Yet more details',
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
        lateMessage: '',
        lateDetail: '',
        timeframes: [5],
        category: 3
      }
    ]));

  });

  it('should return an array of all BaseReminders with updated data when updating a baseReminder', function() {

    var req = {
      body: {
        name: 'We changed the category',
        message: 'Another message',
        detail: 'Some more details',
        lateMessage: 'Another late message',
        lateDetail: 'Some more late details',
        timeframes: [3, 4, 5],
        category: 3
      },
      params: {
        id: 2
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
        name: 'We changed the category',
        message: 'Another message',
        detail: 'Some more details',
        lateMessage: 'Another late message',
        lateDetail: 'Some more late details',
        timeframes: [3, 4, 5],
        category: 3
      }
    ]));


  });

  it('should return an array of all BaseReminders without the deleted baseReminder when deleting a baseReminder', function() {

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
      }
    ]));

  });

  it('should return a 422 error with a message if not all required fields are provided on a post request', function() {

    var req = {
      body: {
        message: 'A 3rd message',
        detail: 'Yet more details',
        lateMessage: 'Yet another late message',
        lateDetail: 'Some more late details',
        timeframes: [5],
        category: 4
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    baseRemindersController.post(req, res);
    assert.ok(res.status.calledWith(422));
    assert.ok(res.send.calledWith({
      status: 422,
      errors: ['name is required']
    }));



  });

  it('should return a 422 error with a message if not all required fields are provided on a put request', function() {

    var req = {
      body: {
        message: 'The message',
        detail: 'The details',
        lateMessage: 'The late message',
        lateDetail: 'The late details',
        timeframes: [5],
        category: 4
      },
      params: {
        id: 2
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    baseRemindersController.put(req, res);
    assert.ok(res.status.calledWith(422));
    assert.ok(res.send.calledWith({
      status: 422,
      errors: ['name is required']
    }));

  });

  it('should return a 422 if timeframes is something other than an array on a post/put request', function() {

    var req = {
      body: {
        name: 'The reminder',
        message: 'The message',
        detail: 'The details',
        lateMessage: 'The late message',
        lateDetail: 'The late details',
        timeframes: '5, 3',
        category: 4
      },
      params: {
        id: 2
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    baseRemindersController.post(req, res);
    assert.ok(res.status.calledWith(422));
    assert.ok(res.send.calledWith({
      status: 422,
      errors: ['timeframes must be an array of timeframe IDs']
    }));

    baseRemindersController.put(req, res);
    assert.ok(res.status.calledWith(422));
    assert.ok(res.send.calledWith({
      status: 422,
      errors: ['timeframes must be an array of timeframe IDs']
    }));

  });

  it('should return a 422 if timeframes is an empty array on a post/put request', function() {

    var req = {
      body: {
        name: 'The reminder',
        message: 'The message',
        detail: 'The details',
        lateMessage: 'The late message',
        lateDetail: 'The late details',
        timeframes: [],
        category: 4
      },
      params: {
        id: 2
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    baseRemindersController.post(req, res);
    assert.ok(res.status.calledWith(422));
    assert.ok(res.send.calledWith({
      status: 422,
      errors: ['timeframes must be an array of timeframe IDs']
    }));

    baseRemindersController.put(req, res);
    assert.ok(res.status.calledWith(422));
    assert.ok(res.send.calledWith({
      status: 422,
      errors: ['timeframes must be an array of timeframe IDs']
    }));

  });

  it('should return a 422 if timeframes array is not all numbers on a post/put request', function() {

    var req = {
      body: {
        name: 'The reminder',
        message: 'The message',
        detail: 'The details',
        lateMessage: 'The late message',
        lateDetail: 'The late details',
        timeframes: ['foo', 3],
        category: 4
      },
      params: {
        id: 2
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    baseRemindersController.post(req, res);
    assert.ok(res.status.calledWith(422));
    assert.ok(res.send.calledWith({
      status: 422,
      errors: ['timeframes must be an array of timeframe IDs']
    }));

    baseRemindersController.put(req, res);
    assert.ok(res.status.calledWith(422));
    assert.ok(res.send.calledWith({
      status: 422,
      errors: ['timeframes must be an array of timeframe IDs']
    }));

  });

  it('should return a 422 if category is not a number', function() {

    var req = {
      body: {
        name: 'The reminder',
        message: 'The message',
        detail: 'The details',
        lateMessage: 'The late message',
        lateDetail: 'The late details',
        timeframes: [2, 3],
        category: 'foo'
      },
      params: {
        id: 2
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    baseRemindersController.post(req, res);
    assert.ok(res.status.calledWith(422));
    assert.ok(res.send.calledWith({
      status: 422,
      errors: ['category must be a category ID']
    }));

    baseRemindersController.put(req, res);
    assert.ok(res.status.calledWith(422));
    assert.ok(res.send.calledWith({
      status: 422,
      errors: ['category must be a category ID']
    }));

  });

});

