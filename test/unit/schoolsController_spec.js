'use strict';

var assert = require('assert');
var sinon = require('sinon');
var httpMocks = require('node-mocks-http');
var httpResponseService = require('../../services/httpResponseService');

// set up test variables
var testSchool0 = {
  "id": "0",
  "userId": 0,
  "name": "First School Of Test",
  "dueDate": "2017-02-01",
  "isActive": "true"
};

var testSchool1 = {
  "id": "1",
  "userId": "0",
  "name": "Second School Of Test",
  "dueDate": "2017-02-01",
  "isActive": "true"
};

var testSchool2 = {
  "id": "2",
  "userId": "1",
  "name": "Third School Of Test",
  "dueDate": "2017-02-01",
  "isActive": "true"
};

// set up mock servce
var mockSchoolsService = {
  findByUserId: function(userId) {
    if (userId == '')
      return [testSchool0, testSchool1];
    if (userId == 1)
      return [testSchool2];
    return "no user";
  },
  findByIdAndUserId: function(schoolId, userId) {

    if (userId == '') {
      if (schoolId == 0)
        return testSchool0;
      if (schoolId == 1)
        return testSchool1;
    }
    if (userId == 1)
      if (schoolId == 2)
        return testSchool2;
  },
  create: function(newSchool) {

    newSchool.id = 3;
    return newSchool;
  },
  update: function(newSchool) {
    if (newSchool.id == 0) {
      testSchool0.name = newSchool.name;
      testSchool0.dueDate = newSchool.dueDate;
      testSchool0.isActive = newSchool.isActive;
      return testSchool0;
    }
  },
  exists: function(schoolId, userId) {
    if (userId == 0 && (schoolId == 0 || schoolId == 1))
      return true;
    if (userId == 1 && schoolId == 2)
      return true;
    return false;
  },
  remove: function(schoolId, userId) {
    if (userId == '' && (schoolId == 0 || schoolId == 1))
      return true;
    if (userId == 1 && schoolId == 2)
      return true;
    return false;
  }
}

var schoolsController = require('../../controllers/schoolsController.js')(mockSchoolsService, httpResponseService());

describe('Schools Controller', function() {

  it('should return a list of schools for a given user', function() {

    var req = {};

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    schoolsController.get(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([testSchool0, testSchool1]));
  });

  it('should return a single school for a given user', function() {

    var req = {params: {schoolId: 0}};

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    schoolsController.getById(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith(testSchool0));

    req = {params: {schoolId: 2}};
    schoolsController.getById(req, res);
    assert.ok(res.status.calledWith(404));
  });

  it('should return a new school with a generated ID', function() {

    var req = {
      body: {
        name: "new",
        dueDate: "2016-01-01",
        isActive: false
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    schoolsController.post(req, res);
    assert.ok(res.status.calledWith(200));

  });

  it('should update a school with matching user and school id', function() {

    var req = {
      params: {schoolId: 0}, body: {
        name: "new",
        dueDate: "2016-01-01",
        isActive: false
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    schoolsController.putOnId(req, res);
    assert.ok(res.status.calledWith(200));

    req = {
      params: {schoolId: 5}, body: {
        name: "new",
        dueDate: "2016-01-01",
        isActive: false
      }
    };

    schoolsController.putOnId(req, res);
    assert.ok(res.status.calledWith(404));

  });

  it('should update a school with matching user and school id', function() {

    var req = {params: {schoolId: 0}};

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    schoolsController.remove(req, res);
    assert.ok(res.status.calledWith(200));

    req = {params: {schoolId: 5}};

    schoolsController.remove(req, res);
    assert.ok(res.status.calledWith(404));

  });

  it('should update a school with matching user and school id', function() {

    var req = { body : { schools : [{
    	  "userId" : "1",
          "name" : "name",
          "dueDate" : "2020-10-20",
          "isActive" : true
        },{
          "userId" : "1",
          "name" : "other name",
          "dueDate" : "2030-10-20",
          "isActive" : true
        }
    ]}};

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    schoolsController.put(req, res);
    assert.ok(res.status.calledWith(200));

    req = {body : { schools : [{
    	  "userId" : "5",
          "name" : "name",
          "dueDate" : "2020-10-20",
          "isActive" : true
        },{
          "userId" : "5",
          "name" : "other name",
          "dueDate" : "2030-10-20",
          "isActive" : true
        }
    ]}};

    schoolsController.put(req, res);
    assert.ok(res.status.calledWith(404));

  });
});
