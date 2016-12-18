'use strict';

var sinon = require('sinon');

module.exports = {
  getYadaguruDataMock: function(service) {
    var methodsToMock = [
      'findAll',
      'findAllIncludingTimeframes',
      'findById',
      'findByName',
      'findByUser',
      'findByIdForUser',
      'findByIdForUserWithBaseReminders',
      'findByUserWithBaseReminders',
      'findByUserForSchoolWithBaseReminders',
      'getUserByPhoneNumber',
      'create',
      'bulkCreate',
      'update',
      'updateForUser',
      'destroy',
      'destroyForUser',
      'verifyUser'
    ];
    var yadaguruDataMock = {};
    yadaguruDataMock.services = {};

    yadaguruDataMock.services[service] = getService();

    yadaguruDataMock.stubMethods = function() {
      for (var service in yadaguruDataMock.services) {
        if (yadaguruDataMock.services.hasOwnProperty(service)) {
          yadaguruDataMock.services[service].stubs = {};
          methodsToMock.forEach(function(method) {
            yadaguruDataMock.services[service].stubs[method] = sinon.stub(yadaguruDataMock.services[service], method);
          });
        }
      }
    };

    yadaguruDataMock.restoreStubs = function() {
      for (var service in yadaguruDataMock.services) {
        if (yadaguruDataMock.services.hasOwnProperty(service)) {
          methodsToMock.forEach(function(method) {
            yadaguruDataMock.services[service].stubs[method].restore();
          });
        }
      }
    };

    yadaguruDataMock.addService = function(service) {
      yadaguruDataMock.services[service] = getService();
    };

    yadaguruDataMock.getMockObject = function() {
      return function(_config) {
        return yadaguruDataMock.services;
      }
    };

    function getService() {
      return methodsToMock.reduce(function(mock, method) {
        mock[method] = function(){};
        return mock;
      }, {});
    }

    return yadaguruDataMock;
  }
};
