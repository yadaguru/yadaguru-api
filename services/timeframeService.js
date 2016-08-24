var moment = require('moment');
var Timeframe = require('../models/').Timeframe;

var outputSanitizer = function(timeframe) {
  if (timeframe.type === 'absolute') {
    timeframe.formula = moment.utc(timeframe.formula).format('YYYY-MM-DD');
  }
  return timeframe;
};

var timeframeService = require('./baseDbService')(Timeframe, outputSanitizer);

module.exports = timeframeService;
