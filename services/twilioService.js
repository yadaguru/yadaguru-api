var logger = require('.loggerService');
var TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || false;
var TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || false;
var TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || false;
var TEST_NUMBER = process.env.TEST_NUMBER || false;
var twilio;

if (TWILIO_PHONE_NUMBER && TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  twilio = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

module.exports = (function() {

  var twilioService = {}

  twilioService.sendMessage = function (to, message) {
    if (!twilio) {
      return sendMockMessage(to, message);
    }

    if (TEST_NUMBER) {
      to = TEST_NUMBER
    }

    return twilio.messages.create({
      to: '+1' + to,
      from: '+1' + TWILIO_PHONE_NUMBER,
      body: message 
    });
  }

  function sendMockMessage(to, message) {
    logger.warn('Twilio credentials missing! Messages will not be sent!');
    logger.debug('to', to);
    logger.debug('message', message);
    return Promise.resolve();
  }

  return twilioService;
})()