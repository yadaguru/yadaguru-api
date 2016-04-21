'use strict';

var assert = require('assert');
var sinon = require('sinon');

var httpResponseService = require('../../services/httpResponseService');

var mockContentItems = [
  {
    id: 1,
    name: 'Item 1',
    content: 'The Item 1'
  },
  {
    id: 2,
    name: 'Item 2',
    content: 'The Item 2'
  }
];

var mockContentItemService = {

  create: function(data) {
    var _mockContentItems = JSON.parse(JSON.stringify(mockContentItems));
    _mockContentItems.push({
      id: 3,
      name: data.name,
      content: data.content
    });
    return _mockContentItems;
  },
  findAll: function() {
    return mockContentItems;
  },
  findById: function(id) {
    var mockContentItem = mockContentItems[id - 1];
    if (mockContentItem) {
      return [mockContentItem];
    }
    return false;
  },
  exists: function(id) {
    return typeof mockContentItems[id - 1] !== 'undefined';
  },
  update: function(id, data) {
    var _mockContentItems = JSON.parse(JSON.stringify(mockContentItems));
    var mockContentItem = _mockContentItems[id - 1];
    mockContentItem.name = data.name;
    mockContentItem.content = data.content;
    return _mockContentItems;
  },
  remove: function(id) {
    var _mockContentItems = JSON.parse(JSON.stringify(mockContentItems));
    _mockContentItems.splice(id - 1, 1);
    return _mockContentItems;
  }

};

var contentItemsController = require('../../controllers/contentItemsController.js')(mockContentItemService, httpResponseService());

describe('ContentItems Controller', function() {

  it('should return an array of all ContentItems when calling get', function() {

    var req = {};

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    contentItemsController.get(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([
      {
        id: 1,
        name: 'Item 1',
        content: 'The Item 1'
      },
      {
        id: 2,
        name: 'Item 2',
        content: 'The Item 2'
      }
    ]));

  });

  it('should return an array of one matching ContentItems when calling getById with an id', function() {

    var req = {
      params: {
        contentItemId: 1
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    contentItemsController.getById(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([
      {
        id: 1,
        name: 'Item 1',
        content: 'The Item 1'
      }
    ]));

  });

  it('should return an array of all contentItems including the new one when posting a new contentItem', function() {

    var req = {
      body: {
        name: 'Item 3',
        content: 'The Item 3'
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    contentItemsController.post(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([
      {
        id: 1,
        name: 'Item 1',
        content: 'The Item 1'
      },
      {
        id: 2,
        name: 'Item 2',
        content: 'The Item 2'
      },
      {
        id: 3,
        name: 'Item 3',
        content: 'The Item 3'
      }
    ]));

  });

  it('should return an array of all contentItems with updated data when updating a contentItem', function() {

    var req = {
      body: {
        name: '2nd Item',
        content: 'The 2nd Item'
      },
      params: {
        contentItemId: 2
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    contentItemsController.putOnId(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([
      {
        id: 1,
        name: 'Item 1',
        content: 'The Item 1'
      },
      {
        id: 2,
        name: '2nd Item',
        content: 'The 2nd Item'
      }
    ]));

  });

  it('should return an array of all ContentItems without the deleted contentItem when deleting a contentItem', function() {

    var req = {
      params: {
        contentItemId: 1
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    contentItemsController.remove(req, res);
    assert.ok(res.status.calledWith(200));
    assert.ok(res.send.calledWith([
      {
        id: 2,
        name: 'Item 2',
        content: 'The Item 2'
      }
    ]));

  });

  it('should 422 error if required fields are missing', function() {

    var req = {
      body: {},
      params: {
        contentItemId: 1
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    contentItemsController.post(req, res);
    assert.ok(res.status.calledWith(422));
    assert.ok(res.send.calledWith({
      status: 422,
      errors: ['name is required', 'content is required']
    }))


  });
  it('should return a 404 if ID does not exist on a put, get, or delete request', function() {

    var req = {
      params: {
        contentItemId: 3
      },
      body: {
        name: '2nd Item',
        content: 'The 2nd Item'
      }
    };

    var res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    contentItemsController.getById(req, res);
    assert.ok(res.status.calledWith(404));
    assert.ok(res.send.calledWith({
      status: 404,
      errors: ['contentItem with id of 3 does not exist']
    }));

    contentItemsController.putOnId(req, res);
    assert.ok(res.status.calledWith(404));
    assert.ok(res.send.calledWith({
      status: 404,
      errors: ['contentItem with id of 3 does not exist']
    }));

    contentItemsController.remove(req, res);
    assert.ok(res.status.calledWith(404));
    assert.ok(res.send.calledWith({
      status: 404,
      errors: ['contentItem with id of 3 does not exist']
    }));

  });

});

