'use strict';

var assert = require('assert');
var sinon = require('sinon');
var httpResponseService = require('../../services/httpResponseService');

var mockCategories = [
  {id: 1, name: 'Foo'},
  {id: 2, name: 'Bar'}
];

var mockCategoryService = {

  create: function(data) {
    var _mockCategories = JSON.parse(JSON.stringify(mockCategories));
    _mockCategories.push({id: 3, name: data.name});
    return _mockCategories;
  },
  findAll: function() {
    return mockCategories;
  },
  findById: function(id) {
    var mockCategory = mockCategories[id - 1];
    if (mockCategory) {
      return [mockCategory];
    }
    return false;
  },
  exists: function(id) {
    return typeof mockCategories[id - 1] !== 'undefined';
  },
  update: function(id, data) {
    var _mockCategories = JSON.parse(JSON.stringify(mockCategories));
    _mockCategories[id - 1].name = data.name;
    return _mockCategories;
  },
  remove: function(id) {
    var _mockCategories = JSON.parse(JSON.stringify(mockCategories));
    _mockCategories.splice(id - 1, 1);
    return _mockCategories;
  }

};

var categoriesController = require('../../controllers/categoriesController.js')(mockCategoryService, httpResponseService());

describe('Categories Controller', function() {

  it('should return an array of all categories when calling get', function() {

    var req = {};

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    categoriesController.get(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([
      {id: 1, name: 'Foo'},
      {id: 2, name: 'Bar'}
    ]));

  });

  it('should return an array of one matching categories when calling getOne with an id', function() {

    var req = {
      params: {
        categoryId: 1
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    categoriesController.getById(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([{id: 1, name: 'Foo'}]));

  });

  it('should return an array of all categories including the new one when posting a new category', function() {

    var req = {
      body: {
        name: 'Bazz'
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    categoriesController.post(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([
      {id: 1, name: 'Foo'},
      {id: 2, name: 'Bar'},
      {id: 3, name: 'Bazz'}
    ]));

  });

  it('should return an array of all categories with updated data when updating a category', function() {

    var req = {
      body: {
        name: 'Fizz'
      },
      params: {
        categoryId: 1
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    categoriesController.putOnId(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([
      {id: 1, name: 'Fizz'},
      {id: 2, name: 'Bar'}
    ]));


  });

  it('should return an array of all categories without the deleted category when deleting a category', function() {

    var req = {
      params: {
        categoryId: 1
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    categoriesController.remove(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([
      {id: 2, name: 'Bar'}
    ]));

  });

  it('should return a 422 error with a message if required fields are missing on a post/put request', function() {

    var req = {
      params: {
        categoryId: 1
      },
      body: {}
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    categoriesController.post(req, res);
    assert.ok(res.status.calledWith(422));
    assert.ok(res.send.calledWith({
      status: 422,
      errors: ['name is required']
    }))

  });

  it('should return a 404 if ID does not exist on a put, get, or delete request', function() {

    var req = {
      params: {
        categoryId: 3
      },
      body: {
        name: 'foo'
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    categoriesController.getById(req, res);
    assert.ok(res.status.calledWith(404));
    assert.ok(res.send.calledWith({
      status: 404,
      errors: ['category with id of 3 does not exist']
    }));

    categoriesController.putOnId(req, res);
    assert.ok(res.status.calledWith(404));
    assert.ok(res.send.calledWith({
      status: 404,
      errors: ['category with id of 3 does not exist']
    }));

    categoriesController.remove(req, res);
    assert.ok(res.status.calledWith(404));
    assert.ok(res.send.calledWith({
      status: 404,
      errors: ['category with id of 3 does not exist']
    }));

  });

});

