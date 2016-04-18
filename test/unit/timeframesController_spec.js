'use strict';

var assert = require('assert');
var sinon = require('sinon');

var httpResponseService = require('../../services/httpResponseService');

var mockTimeframes = [
  {
    id: 1,
    name: '60 Days',
    type: 'relative',
    formula: '60'
  },
  {
    id: 2,
    name: 'January 1',
    type: 'absolute',
    formula: '2016-01-01'
  }
];

var mockTimeframeService = {

  create: function(data) {
    var _mockTimeframes = JSON.parse(JSON.stringify(mockTimeframes));
    _mockTimeframes.push({
      id: 3,
      name: data.name,
      type: data.type,
      formula: data.formula || ''
    });
    return _mockTimeframes;
  },
  findAll: function() {
    return mockTimeframes;
  },
  findOne: function(id) {
    return [mockTimeframes[id - 1]];
  },
  update: function(id, data) {
    var _mockTimeframes = JSON.parse(JSON.stringify(mockTimeframes));
    var mockTimeframe = _mockTimeframes[id - 1];
    mockTimeframe.name = data.name;
    mockTimeframe.type = data.type;
    mockTimeframe.formula = data.formula || '';
    _mockTimeframes[id - 1] = mockTimeframe;
    return _mockTimeframes;
  },
  destroy: function(id) {
    var _mockTimeframes = JSON.parse(JSON.stringify(mockTimeframes));
    _mockTimeframes.splice(id - 1, 1);
    return _mockTimeframes;
  }

};

var timeframesController = require('../../controllers/timeframesController.js')(mockTimeframeService, httpResponseService());

describe('Timeframe Controller', function() {

  it('should return an array of all Timeframe when calling getAll', function() {

    var req = {};

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    timeframesController.getAll(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([
      {
        id: 1,
        name: '60 Days',
        type: 'relative',
        formula: '60'
      },
      {
        id: 2,
        name: 'January 1',
        type: 'absolute',
        formula: '2016-01-01'
      }
    ]));

  });

  it('should return an array of one matching Timeframe when calling getOne with an id', function() {

    var req = {
      params: {
        id: 1
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    timeframesController.getOne(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([
      {
        id: 1,
        name: '60 Days',
        type: 'relative',
        formula: '60'
      }
    ]));

  });

  it('should return an array of all Timeframe including the new one when posting a new timeframe', function() {

    var req = {
      body: {
        name: '30 Days',
        type: 'relative',
        formula: '30'
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    timeframesController.post(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([
      {
        id: 1,
        name: '60 Days',
        type: 'relative',
        formula: '60'
      },
      {
        id: 2,
        name: 'January 1',
        type: 'absolute',
        formula: '2016-01-01'
      },
      {
        id: 3,
        name: '30 Days',
        type: 'relative',
        formula: '30'
      }
    ]));

  });

  it('should accept a request with no "formula" when creating/updating a new timeframe with "now" type', function() {

    debugger;
    var req = {
      body: {
        name: 'Immediately',
        type: 'now'
      },
      params: {
        id: 1
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    timeframesController.post(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([
      {
        id: 1,
        name: '60 Days',
        type: 'relative',
        formula: '60'
      },
      {
        id: 2,
        name: 'January 1',
        type: 'absolute',
        formula: '2016-01-01'
      },
      {
        id: 3,
        name: 'Immediately',
        type: 'now',
        formula: ''
      }
    ]));

    timeframesController.put(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([
      {
        id: 1,
        name: 'Immediately',
        type: 'now',
        formula: ''
      },
      {
        id: 2,
        name: 'January 1',
        type: 'absolute',
        formula: '2016-01-01'
      }
    ]));

  });

  it('should return an array of all Timeframe with updated data when updating a timeframe', function() {

    var req = {
      body: {
        name: '60 Days from now',
        type: 'relative',
        formula: '60'
      },
      params: {
        id: 1
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    timeframesController.put(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([
      {
        id: 1,
        name: '60 Days from now',
        type: 'relative',
        formula: '60'
      },
      {
        id: 2,
        name: 'January 1',
        type: 'absolute',
        formula: '2016-01-01'
      }
    ]));


  });

  it('should return an array of all Timeframe without the deleted timeframe when deleting a timeframe', function() {

    var req = {
      params: {
        id: 1
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    timeframesController.del(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([
      {
        id: 2,
        name: 'January 1',
        type: 'absolute',
        formula: '2016-01-01'
      }
    ]));

  });

  it('should return a 422 error if "type" is not "absolute", "relative", or "now" on put/post', function() {

    var req = {
      body: {
        name: '90 Days',
        type: 'foobar',
        formula: 90
      },
      params: {
        id: 1
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    timeframesController.post(req, res);
    assert.ok(res.status.calledWith(422));
    assert.ok(res.send.calledWith({
      status: 422,
      errors: ['type must be "absolute", "relative", or "now"']
    }));

    timeframesController.put(req, res);
    assert.ok(res.status.calledWith(422));
    assert.ok(res.send.calledWith({
      status: 422,
      errors: ['type must be "absolute", "relative", or "now"']
    }));


  });

  it('should return a 422 error if "formula" is not an ISO8601 date on type "absolute" on put/post', function() {

    var req = {
      body: {
        name: 'January 1',
        type: 'absolute',
        formula: '1/1/2017'
      },
      params: {
        id: 1
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    timeframesController.post(req, res);
    assert.ok(res.status.calledWith(422));
    assert.ok(res.send.calledWith({
      status: 422,
      errors: ['formula must be a positive integer if type is "relative" or an ISO8601 date if type is "absolute"']
    }));

    timeframesController.put(req, res);
    assert.ok(res.status.calledWith(422));
    assert.ok(res.send.calledWith({
      status: 422,
      errors: ['formula must be a positive integer if type is "relative" or an ISO8601 date if type is "absolute"']
    }));

  });

  it('should return a 422 error there are missing required fields on put/post', function() {

    var req = {
      body: {
        formula: '90 days'
      },
      params: {
        id: 1
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    timeframesController.post(req, res);
    assert.ok(res.status.calledWith(422));
    assert.ok(res.send.calledWith({
      status: 422,
      errors: ['name is required', 'type is required']
    }));

    timeframesController.put(req, res);
    assert.ok(res.status.calledWith(422));
    assert.ok(res.send.calledWith({
      status: 422,
      errors: ['name is required', 'type is required']
    }));

  });

});

