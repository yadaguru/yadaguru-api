'use strict';

var assert = require('assert');
var sinon = require('sinon');

var httpResponseService = require('../../services/httpResponseService');

var mockTestDates = [
  {
    id: 1,
    test: 1,
    registrationDate: '2016-01-01',
    adminDate: '2016-02-01'
  },
  {
    id: 2,
    test: 2,
    registrationDate: '2016-03-01',
    adminDate: '2016-04-01'
  }
];

var mockTestDatesService = {

  create: function(data) {
    var _mockTestDates = JSON.parse(JSON.stringify(mockTestDates));
    _mockTestDates.push({
      id: 3,
      test: data.test,
      registrationDate: data.registrationDate,
      adminDate: data.adminDate
    });
    return _mockTestDates;
  },
  findAll: function() {
    return mockTestDates;
  },
  findOne: function(id) {
    return [mockTestDates[id - 1]];
  },
  update: function(id, data) {
    var _mockTestDates = JSON.parse(JSON.stringify(mockTestDates));
    var mockTestDate = _mockTestDates[id - 1];
    mockTestDate.test = data.test;
    mockTestDate.registrationDate = data.registrationDate;
    mockTestDate.adminDate = data.adminDate;
    return _mockTestDates;
  },
  destroy: function(id) {
    mockTestDates.splice(id - 1, 1);
    return mockTestDates;
  }

};

var testDatesController = require('../../controllers/testDatesController.js')(mockTestDatesService, httpResponseService());

describe('Test Dates Controller', function() {

  it('should return an array of all Tests when calling getAll', function() {

    var req = {};

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    testDatesController.getAll(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([
      {
        id: 1,
        test: 1,
        registrationDate: '2016-01-01',
        adminDate: '2016-02-01'
      },
      {
        id: 2,
        test: 2,
        registrationDate: '2016-03-01',
        adminDate: '2016-04-01'
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

    testDatesController.getOne(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([
      {
        id: 1,
        test: 1,
        registrationDate: '2016-01-01',
        adminDate: '2016-02-01'
      }
    ]));

  });

  it('should return an array of all tests including the new one when posting a new test', function() {

    var req = {
      body: {
        test: 3,
        registrationDate: '2016-05-01',
        adminDate: '2016-06-01'
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    testDatesController.post(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([
      {
        id: 1,
        test: 1,
        registrationDate: '2016-01-01',
        adminDate: '2016-02-01'
      },
      {
        id: 2,
        test: 2,
        registrationDate: '2016-03-01',
        adminDate: '2016-04-01'
      },
      {
        id: 3,
        test: 3,
        registrationDate: '2016-05-01',
        adminDate: '2016-06-01'
      }
    ]));

  });

  it('should return an array of all tests with updated data when updating a test', function() {

    var req = {
      body: {
        test: 2,
        registrationDate: '2016-07-01',
        adminDate: '2016-08-01'
      },
      params: {
        id: 2
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    testDatesController.put(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([
      {
        id: 1,
        test: 1,
        registrationDate: '2016-01-01',
        adminDate: '2016-02-01'
      },
      {
        id: 2,
        test: 2,
        registrationDate: '2016-07-01',
        adminDate: '2016-08-01'
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

    testDatesController.del(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([
      {
        id: 2,
        test: 2,
        registrationDate: '2016-03-01',
        adminDate: '2016-04-01'
      }
    ]));

  });

  it('should 422 error if required fields are not provided', function() {

    var req = {
      body: {},
      params: {
        id: 1
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    testDatesController.post(req, res);
    assert.ok(res.status.calledWith(422));
    assert.ok(res.send.calledWith(
      {
        status: 422,
        errors: ['test is required', 'registrationDate is required', 'adminDate is required']
      }
    ));

    testDatesController.put(req, res);
    assert.ok(res.status.calledWith(422));
    assert.ok(res.send.calledWith(
      {
        status: 422,
        errors: ['test is required', 'registrationDate is required', 'adminDate is required']
      }
    ));

  });

  it('should 422 error if test field is not a number', function() {

    var req = {
      body: {
        test: 'SAT',
        registrationDate: '2016-01-01',
        adminDate: '2016-02-02'
      },
      params: {
        id: 1
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    testDatesController.post(req, res);
    assert.ok(res.status.calledWith(422));
    assert.ok(res.send.calledWith(
      {
        status: 422,
        errors: ['test must be a test ID']
      }
    ));

    testDatesController.put(req, res);
    assert.ok(res.status.calledWith(422));
    assert.ok(res.send.calledWith(
      {
        status: 422,
        errors: ['test must be a test ID']
      }
    ));

  });

  it('should 422 error if registrationDate field is not an ISO8601 date', function() {

    var req = {
      body: {
        test: 1,
        registrationDate: '1/1/2016',
        adminDate: '2016-02-02'
      },
      params: {
        id: 1
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    testDatesController.post(req, res);
    assert.ok(res.status.calledWith(422));
    assert.ok(res.send.calledWith(
      {
        status: 422,
        errors: ['registrationDate must be an ISO8601 formatted date']
      }
    ));

    testDatesController.put(req, res);
    assert.ok(res.status.calledWith(422));
    assert.ok(res.send.calledWith(
      {
        status: 422,
        errors: ['registrationDate must be an ISO8601 formatted date']
      }
    ));

  });

  it('should 422 error if adminDate field is not an ISO8601 date', function() {

    var req = {
      body: {
        test: 1,
        registrationDate: '2016-01-01',
        adminDate: 'February 2, 2016'
      },
      params: {
        id: 1
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    testDatesController.post(req, res);
    assert.ok(res.status.calledWith(422));
    assert.ok(res.send.calledWith(
      {
        status: 422,
        errors: ['adminDate must be an ISO8601 formatted date']
      }
    ));

    testDatesController.put(req, res);
    assert.ok(res.status.calledWith(422));
    assert.ok(res.send.calledWith(
      {
        status: 422,
        errors: ['adminDate must be an ISO8601 formatted date']
      }
    ));

  });

});

