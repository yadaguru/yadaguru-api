'use strict';

var assert = require('assert');
var sinon = require('sinon');
var httpMocks = require('node-mocks-http');

var mockTests = [
  {
    id: 1,
    type: 'SAT',
    message: 'The SATs',
    detail: 'Some details'
  },
  {
    id: 2,
    type: 'ACT',
    message: 'The ACTs',
    detail: 'Some details'
  }
];

var mockTestService = {

  create: function(data) {
    mockTests.push({
      id: 3,
      type: data.type,
      message: data.message,
      detail: data.detail
    });
    return mockTests;
  },
  findAll: function() {
    return mockTests;
  },
  findOne: function(id) {
    return [mockTests[id - 1]];
  },
  update: function(id, data) {
    var mockTest = mockTests[id - 1];
    mockTest.type = data.type;
    mockTest.message = data.message;
    mockTest.detail = data.detail;
    return mockTests;
  },
  destroy: function(id) {
    mockTests.splice(id - 1, 1);
    return mockTests;
  }

};

var testsController = require('../../controllers/testsController.js')(mockTestService);

describe('Tests Controller', function() {

  it('should return an array of all Tests when calling getAll', function() {

    var req = {};

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    testsController.getAll(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([
      {
        id: 1,
        type: 'SAT',
        message: 'The SATs',
        detail: 'Some details'
      },
      {
        id: 2,
        type: 'ACT',
        message: 'The ACTs',
        detail: 'Some details'
      }
    ]));

  });

  it('should return an array of one matching Tests when calling getOne with an id', function() {

    var req = {
      params: {
        id: 1
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    testsController.getOne(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([
      {
        id: 1,
        type: 'SAT',
        message: 'The SATs',
        detail: 'Some details'
      }
    ]));

  });

  it('should return an array of all tests including the new one when posting a new test', function() {

    var req = {
      body: {
        type: 'OWLs',
        message: 'The Ordinary Wizarding Levels',
        detail: 'Some details'
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    testsController.post(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([
      {
        id: 1,
        type: 'SAT',
        message: 'The SATs',
        detail: 'Some details'
      },
      {
        id: 2,
        type: 'ACT',
        message: 'The ACTs',
        detail: 'Some details'
      },
      {
        id: 3,
        type: 'OWLs',
        message: 'The Ordinary Wizarding Levels',
        detail: 'Some details'
      }
    ]));

  });

  it('should return an array of all tests with updated data when updating a test', function() {

    var req = {
      body: {
        type: 'NEWTs',
        message: 'Nastily Exhausting Wizarding Test',
        detail: 'Some details'
      },
      params: {
        id: 3
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    testsController.put(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([
      {
        id: 1,
        type: 'SAT',
        message: 'The SATs',
        detail: 'Some details'
      },
      {
        id: 2,
        type: 'ACT',
        message: 'The ACTs',
        detail: 'Some details'
      },
      {
        id: 3,
        type: 'NEWTs',
        message: 'Nastily Exhausting Wizarding Test',
        detail: 'Some details'
      }
    ]));


  });

  it('should return an array of all Tests without the deleted test when deleting a test', function() {

    var req = {
      params: {
        id: 1
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    testsController.del(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([
      {
        id: 2,
        type: 'ACT',
        message: 'The ACTs',
        detail: 'Some details'
      },
      {
        id: 3,
        type: 'NEWTs',
        message: 'Nastily Exhausting Wizarding Test',
        detail: 'Some details'
      }
    ]));

  });

});

