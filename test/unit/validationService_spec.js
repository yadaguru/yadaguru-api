var chai = require('chai');
chai.should();

var validationService = require('../../services/validationService');

describe('The hasMissingFields method', function() {

  var hasMissingFields = validationService.hasMissingFields;
  var requiredFields = ['name', 'age'];

  it('should return false if all required fields are in values object', function() {
    var values = {
      name: 'Bob',
      age: '35'
    };

    hasMissingFields(values, requiredFields).should.be.false;
  });

  it('should return an array of any missing fields', function() {
    var values = {
      name: 'Bob',
      gender: 'male'
    };

    hasMissingFields(values, requiredFields).should.include('age');

  });

});
