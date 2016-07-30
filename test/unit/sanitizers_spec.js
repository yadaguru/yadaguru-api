var chai = require('chai');
chai.should();

var sanitizers = require ('../../services/sanitizerService');

describe('Sanitizers', function() {
  describe('sanitizeDigitString', function() {
    it('should return a string of digits void of any spaces, dashes, parentheses, or other non-numbers', function() {
      sanitizers.sanitizers.sanitizeDigitString('123-456-7890').should.equal('1234567890');
      sanitizers.sanitizers.sanitizeDigitString('(123) 456-7890').should.equal('1234567890');
      sanitizers.sanitizers.sanitizeDigitString('(123) ?foobar 456-7890 ').should.equal('1234567890');
    });
  });

  describe('sanitizeRequest', function() {
    var validationSchema = {
      toSanitize: {
        sanitizers: ['sanitizeDigitString']
      },
      toNotSanitize: {},
      unrequiredField: {
        sanitize: ['sanitizeDigitString']
      }
    };

    it('should return the request body with all indicated values sanitized', function() {
      var requestBody = {
        toSanitize: '123-456-7890',
        toNotSanitize: '123-456-7890'
      };

      var sanitizedRequestBody = sanitizers.sanitizeRequest(requestBody, validationSchema);
      sanitizedRequestBody.should.deep.equal({
        toSanitize: '1234567890',
        toNotSanitize: '123-456-7890'
      })
    })
  })
});
