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
      baseReminder.timeframeIds = newTimeframeAssociations[0].map(function(newTimeframeAssociation) {
        return newTimeframeAssociation.dataValues.TimeframeId;
      });
      return [baseReminder];
    });
  });
};

baseReminderService.update = function(id, data) {
  return BaseReminder.findById(id).then(function(row) {
    if (!row) {
      return Promise.resolve(false);
    }

    return BaseReminder.update(data).then(function(updatedBaseReminder) {
      var baseReminder = updatedBaseReminder.dataValues;
      if (data.timeframeIds) {
        return updatedBaseReminder.setTimeframes(data.timeframeIds).then(function(updatedTimeframeAssociations) {
          baseReminder.timeframeIds = updatedTimeframeAssociations[0].map(function(updatedTimeframeAssociation) {
            return updatedTimeframeAssociation.dataValues.TimeframeId;
          });
          return [baseReminder];
        });
      }
      return updatedBaseReminder.getTimeframes().then(function(timeframes) {
        baseReminder.timeframeIds = timeframes.map(function(timeframe) {
          return timeframe.dataValues.id;
        });
        return [baseReminder];
      })
    })
  })
};

baseReminderService.destroy = function(id) {
  return BaseReminder.findById(id).then(function(baseReminder) {
    if (!baseReminder) {
      return Promise.resolve(false);
    }

    return baseReminder.setTimeframes([]).then(function() {
      return baseReminder.destroy().then(function() {
        return true;
      })
    })

  })
};

module.exports = baseReminderService;
