'use strict';

var assert = require('assert');
var sinon = require('sinon');

var httpResponseService = require('../../services/httpResponseService');

var mockUserId = 1;
var mockSchools = [{
  id: 1,
  userId: 1,
  name: 'Temple',
  dueDate: '2017-02-01',
  isActive: true
}, {
  id: 2,
  userId: 1,
  name: 'Drexel',
  dueDate: '2017-02-15',
  isActive: true
}];

var _mockSchools = JSON.parse(JSON.stringify(mockSchools));

var mockSchoolsService = {
  findByUserId: function(userId) {
    if (userId === mockUserId) {
      return mockSchools;
    } else {
      return [];
    }
  },
  findByIdAndUserId: function(schoolId, userId) {
    if (userId === mockUserId) {
      var mockSchool = mockSchools[schoolId - 1];
      if (mockSchool) {
        return [mockSchool]
      } else {
        return false;
      }
    } else {
      return false;
    }
  },
  create: function(data) {
    mockSchools.push({
      id: 3,
      userId: mockUserId,
      name: data.name,
      dueDate: data.dueDate,
      isActive: data.isActive
    });
    return mockSchools;
  },
  update: function(schoolId, userId, data) {
    var id = schoolId - 1;
    Object.keys(data).forEach(function(key) {
      if (mockSchools[id].hasOwnProperty(key)) {
        mockSchools[id][key] = data[key];
      }
    });

    return mockSchools;

  },
  exists: function(schoolId, userId) {
    return typeof mockSchools[schoolId - 1] !== 'undefined' && userId === mockUserId;
  },
  remove: function(schoolId, userId) {
    mockSchools.splice(schoolId - 1, 1);
    return mockSchools;
  },
  _resetData: function() {
    mockSchools = JSON.parse(JSON.stringify(_mockSchools));
  }
};

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
    assert.ok(res.send.calledWith([{
      id: 1,
      userId: 1,
      name: 'Temple',
      dueDate: '2017-02-01',
      isActive: true
    }, {
      id: 2,
      userId: 1,
      name: 'Drexel',
      dueDate: '2017-02-15',
      isActive: true
    }]));

  });

  it('should return a single school for a given user', function() {

    var req = {params: {schoolId: 1}};

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    schoolsController.getById(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([{
      id: 1,
      userId: 1,
      name: 'Temple',
      dueDate: '2017-02-01',
      isActive: true
    }]));

  });

  it('should return a new school with a generated ID, along with existing schools', function() {

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
    assert.ok(res.send.calledWith([{
      id: 1,
      userId: 1,
      name: 'Temple',
      dueDate: '2017-02-01',
      isActive: true
    }, {
      id: 2,
      userId: 1,
      name: 'Drexel',
      dueDate: '2017-02-15',
      isActive: true
    }, {
      id: 3,
      userId: 1,
      name: "new",
      dueDate: "2016-01-01",
      isActive: false
    }]));

    mockSchoolsService._resetData();

  });

  it('should update a school with matching user and school id, and return all schools', function() {

    var req = {
      params: {schoolId: 1}, body: {
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
    assert.ok(res.send.calledWith([{
      id: 1,
      userId: 1,
      name: 'new',
      dueDate: '2016-01-01',
      isActive: false
    }, {
      id: 2,
      userId: 1,
      name: 'Drexel',
      dueDate: '2017-02-15',
      isActive: true
    }]));

    mockSchoolsService._resetData();

  });

  it('should remove a school with matching user and school id, and return all schools', function() {

    var req = {params: {schoolId: 1}};

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    schoolsController.remove(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([{
      id: 2,
      userId: 1,
      name: 'Drexel',
      dueDate: '2017-02-15',
      isActive: true
    }]));

    mockSchoolsService._resetData();

  });

  it('should update all schools for a user', function() {

    var req = {
      body: {
        isActive: false
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    schoolsController.put(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([{
      id: 1,
      userId: 1,
      name: 'Temple',
      dueDate: '2017-02-01',
      isActive: false
    }, {
      id: 2,
      userId: 1,
      name: 'Drexel',
      dueDate: '2017-02-15',
      isActive: false
    }]));

    mockSchoolsService._resetData();

  });

  it('should return a 404 if school id is not found on get/put/delete requests', function() {

    var req = {
      body: {
        isActive: false
      },
      params: {
        schoolId: 3
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    schoolsController.getById(req, res);
    assert.ok(res.status.calledWith(404));
    assert.ok(res.send.calledWith({
      status: 404,
      errors: ['school with id of 3 does not exist']
    }));

    schoolsController.putOnId(req, res);
    assert.ok(res.status.calledWith(404));
    assert.ok(res.send.calledWith({
      status: 404,
      errors: ['school with id of 3 does not exist']
    }));

    schoolsController.remove(req, res);
    assert.ok(res.status.calledWith(404));
    assert.ok(res.send.calledWith({
      status: 404,
      errors: ['school with id of 3 does not exist']
    }));

    mockUserId = 2;

    schoolsController.put(req, res);
    assert.ok(res.status.calledWith(404));
    assert.ok(res.send.calledWith({
      status: 404,
      errors: ['schools for user with id of 1 do not exist']
    }));

    mockSchoolsService._resetData();

  });

  it('should return a 422 with invalid data on post/put requests', function() {

    var req = {
      body: {
        name: 'new',
        dueDate: 'foobar',
        isActive: 1
      },
      params: {
        schoolId: 3
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    schoolsController.post(req, res);
    assert.ok(res.status.calledWith(422));
    assert.ok(res.send.calledWith({
      status: 422,
      errors: ['dueDate must be an ISO8601 formatted date', 'isActive must be boolean']
    }));

    schoolsController.putOnId(req, res);
    assert.ok(res.status.calledWith(422));
    assert.ok(res.send.calledWith({
      status: 422,
      errors: ['dueDate must be an ISO8601 formatted date', 'isActive must be boolean']
    }));

    schoolsController.put(req, res);
    assert.ok(res.status.calledWith(422));
    assert.ok(res.send.calledWith({
      status: 422,
      errors: ['dueDate must be an ISO8601 formatted date', 'isActive must be boolean']
    }));

  });

  it('should return a 422 with missing required fields on post requests', function() {

    var req = {
      body: {}
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    schoolsController.post(req, res);
    assert.ok(res.status.calledWith(422));
    assert.ok(res.send.calledWith({
      status: 422,
      errors: ['name is required', 'dueDate is required', 'isActive is required']
    }));

  });

  it('should return a 422 with an empty body on a put request', function() {

    var req = {
      body: {},
      params: {
        schoolId: 1
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    schoolsController.putOnId(req, res);
    assert.ok(res.status.calledWith(422));
    assert.ok(res.send.calledWith({
      status: 422,
      errors: ['at least one valid field is required']
    }));

    schoolsController.put(req, res);
    assert.ok(res.status.calledWith(422));
    assert.ok(res.send.calledWith({
      status: 422,
      errors: ['at least one valid field is required']
    }));

  });



});
