var models = require('../models/');
var BaseReminder = models.BaseReminder;
var Timeframe = models.Timeframe;
var baseReminderService = require('./baseDbService')(BaseReminder);

baseReminderService.findAll = function() {
  return BaseReminder.findAll({include: Timeframe}).then(function(resp) {
    var baseReminders = resp.map(function(resp) {
      return resp.dataValues;
    });

    return baseReminders.map(function(baseReminder) {
      baseReminder.timeframeIds = baseReminder.Timeframes.map(function(timeframeResp) {
        return timeframeResp.dataValues.id;
      });
      delete baseReminder.Timeframes;
      return baseReminder;
    });

  });
};

baseReminderService.findById = function(id) {
  return BaseReminder.findById(id, {include: Timeframe}).then(function(resp) {
    if (!resp) {
      return [];
    }

    var baseReminder = resp.dataValues;

    baseReminder.timeframeIds = baseReminder.Timeframes.map(function(timeframeResp) {
      return timeframeResp.dataValues.id;
    });
    delete baseReminder.Timeframes;
    return [baseReminder];

  });
};

baseReminderService.create = function(data) {
  var timeframes = data.timeframeIds;

  return BaseReminder.create(data).then(function(newBaseReminder) {
    var baseReminder = newBaseReminder.dataValues;
    return newBaseReminder.setTimeframes(timeframes).then(function(newTimeframeAssociations) {
      var timeframeIds = newTimeframeAssociations[0].map(function(newTimeframeAssociation) {
        return newTimeframeAssociation.dataValues.TimeframeId;
      });
      baseReminder.timeframeIds = timeframeIds;
      return [baseReminder];
    });
  });
};

module.exports = baseReminderService;
