var chai = require('chai');
chai.should();
var should = chai.should();

var ValidationError = require('../../lib/errors');
var validators = require ('../../lib/validators');

describe('Validators', function() {
  var validationSchema = {
    allCaps: {
      required: true,
      rules: [{
        validator: 'isUppercase',
        message: 'Must be in all caps'
      }]
    },
    number: {
      required: false,
      rules: [{
        validator: 'isNumeric',
        message: 'Must be a number'
      }]
    },
    sixDigits: {
      required: false,
      rules: [{
        validator: 'isLength',
        message: 'Must be six digits',
        options: {min: 6, max: 6}
      }, {
        validator: 'isNumeric',
        message: 'Must be all digits'
      }],
      sanitizers: ['sanitizeDigitString']
    },
    justRequired: {
      required: true
    }
  };

  describe('validateRequest', function() {
    it('Should return an object with isValid: true if all validations pass', function() {
      var requestBody = {
        allCaps: 'FOOBAR',
        number: '42',
        sixDigits: '123456'
      };

      var validation = validators.validateRequest(requestBody, validationSchema);

      should.not.exist(validation.errors);
      validation.isValid.should.be.true;
    });

    it('should return an object with isValid: false and a ValidationError object', function() {
      var requestBody = {
        allCaps: 'FOOBAR',
        number: 'abc',
        sixDigits: '12345'
      };

      var validation = validators.validateRequest(requestBody, validationSchema);

      validation.errors.should.be.instanceof(ValidationError.constructor);
      validation.isValid.should.be.false;

    });
  });

  describe('validateAll', function() {
    it('should return isValid: true if all required fields are present and valid', function() {
      var requestBody = {
        allCaps: 'FOOBAR',
        number: '123',
        sixDigits: '123456',
        justRequired: 'foobar'
      };

      var validation = validators.validateRequest(requestBody, validationSchema);

      should.not.exist(validation.errors);
      validation.isValid.should.be.true;
    });

    it('should return errors if required fields are missing on validateAll', function() {
      var requestBody = {
        allCaps: 'FOOBAR',
        number: '42',
        sixDigits: '123456'
      };

      var validation = validators.validateAll(requestBody, validationSchema);

      validation.errors.should.be.instanceof(ValidationError.constructor);
      validation.isValid.should.be.false;
    });
  });

  describe('sanitizeAndValidate', function() {
    it('should sanitize values, check validation for all fields in schema and return an object with sanitized data if valid', function() {
      var requestBody = {
        allCaps: 'FOOBAR',
        number: '42',
        sixDigits: '123-456',
        justRequired: 'justRequired'
      };

      var validation = validators.sanitizeAndValidate(requestBody, validationSchema, true);
      validation.isValid.should.be.true;
      validation.sanitizedData = {
        allCaps: 'FOOBAR',
        number: '42',
        sixDigits: '123456',
        justRequired: 'justRequired'
      }
    });

    it('should sanitize values, check validation for all fields in schema, and return an object with errors if invalid', function() {
      var requestBody = {
        allCaps: 'FOOBAR',
        number: '42',
        sixDigits: '123-4567',
        justRequired: 'justRequired'
      };

      var validation = validators.sanitizeAndValidate(requestBody, validationSchema, true);
      validation.isValid.should.be.false;
      validation.errors.should.be.instanceof(ValidationError.constructor);
    });

    it('should sanitize values, check validation for fields in request and return an object with sanitized data if valid', function() {
      var requestBody = {
        allCaps: 'FOOBAR',
        sixDigits: '123-456',
        justRequired: 'justRequired'
      };

      var validation = validators.sanitizeAndValidate(requestBody, validationSchema);
      validation.isValid.should.be.true;
      validation.sanitizedData = {
        allCaps: 'FOOBAR',
        sixDigits: '123456',
        justRequired: 'justRequired'
      }
    });

    it('should sanitize values, check validation for all fields in request, and return an object with errors if invalid', function() {
      var requestBody = {
        allCaps: 'FOOBAR',
        sixDigits: '123-4567',
        justRequired: 'justRequired'
      };

      var validation = validators.sanitizeAndValidate(requestBody, validationSchema, true);
      validation.isValid.should.be.false;
      validation.errors.should.be.instanceof(ValidationError.constructor);
    });
  });

  describe('phoneNumber validator', function() {
    it('should return true given a string of 10 digits', function() {
      validators.validators.isPhoneNumber('1234567890').should.be.true;
      validators.validators.isPhoneNumber('123456789a').should.be.false;
    });

    it('should return false if string is more or less than 10 characters long', function() {
      validators.validators.isPhoneNumber('123456789').should.be.false;
      validators.validators.isPhoneNumber('12345678901').should.be.false;
    });

    it('should return false if string contains characters other than numbers', function() {
      validators.validators.isPhoneNumber('abcd1234!?').should.be.false;
    });
  });

  describe('isSixDigits', function() {
    it('should return true if given string is 6 digits', function() {
      validators.validators.isSixDigits('123456').should.be.true;
    });

    it('should return false if given string is less or more than 6 digits', function() {
      validators.validators.isSixDigits('12345').should.be.false;
      validators.validators.isSixDigits('1234567').should.be.false;
    });

    it('should return false if given string contains characters other than numbers', function() {
      validators.validators.isSixDigits('I2E4$G').should.be.false;
    });
  })

  describe('isNonEmptyArray', function() {
    it('should return true on an array with a length greater than 1', function() {
      validators.validators.isNonEmptyArray([1, 2, 3]).should.be.true;
    });

    it('should return false an empty array with no members', function() {
      validators.validators.isNonEmptyArray([]).should.be.false;
    });
  })

  describe('isArrayOfNumbers', function() {
    it('should return true on an array where all members are numbers', function() {
      validators.validators.isArrayOfNumbers([1, 2, 3]).should.be.true;
    });

    it('should return false on an array where at least one member is not a number', function() {
      validators.validators.isArrayOfNumbers([1, '2', 3]).should.be.false;
      validators.validators.isArrayOfNumbers([1, NaN, 3]).should.be.false;
    });

    it('should return false on an empty array', function() {
      validators.validators.isArrayOfNumbers([]).should.be.false;
    });

    it('should return false on a non-array', function() {
      validators.validators.isArrayOfNumbers({}).should.be.false;
      validators.validators.isArrayOfNumbers('1 2').should.be.false;
      validators.validators.isArrayOfNumbers(3).should.be.false;
    });
  })

});
