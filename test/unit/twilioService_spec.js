var sinon = require('sinon');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');
chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.should();

var proxyquire = require('proxyquire');
var twilioService = require('../../services/authService');

describe('The twilioService', function() {
  var twilioService, twilioMock, createSpy;
  var to = '1234567890';
  var message = 'Foobar';

  beforeEach(function() {
    twilioMock = {
      messages: {
        create: function(){return Promise.resolve()}
      }
    };
    createSpy = sinon.spy(twilioMock.messages, 'create');

    process.env.TWILIO_PHONE_NUMBER = '1234567890';
    process.env.TWILIO_ACCOUNT_SID = '246810';
    process.env.TWILIO_AUTH_TOKEN = '13579';

    twilioService = proxyquire('../../services/twilioService', {
      'twilio': function() {return twilioMock}
    });
  });

  afterEach(function() {
    twilioService = undefined;
    createSpy.restore();
  });

  describe('The sendMessage function', function() {
    it('not send messages through twilio if credentials are missing', function() {
      delete process.env.TWILIO_PHONE_NUMBER;
      twilioService = proxyquire('../../services/twilioService', {
        'twilio': function() {return twilioMock}
      })

      return twilioService.sendMessage(to, message).then(function() {
        createSpy.should.not.have.been.called;
      });
    });

    it('should send the provided SMS message to the provided to number', function() {
      return twilioService.sendMessage(to, message).then(function() {
        createSpy.should.have.been.calledWith({
          to: '+1' + to,
          from: '+1' + process.env.TWILIO_PHONE_NUMBER,
          body: message
        });
      });
    });

    it('should send provided SMS message to test number, if set', function() {
      process.env.TEST_NUMBER = '0987654321';

      twilioService = proxyquire('../../services/twilioService', {
        'twilio': function() {return twilioMock}
      });

      return twilioService.sendMessage(to, message).then(function() {
        createSpy.should.have.been.calledWith({
          to: '+1' + process.env.TEST_NUMBER,
          from: '+1' + process.env.TWILIO_PHONE_NUMBER,
          body: message
        });
      });
    });
  });
});
