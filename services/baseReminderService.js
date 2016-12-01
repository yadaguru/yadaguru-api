var models = require('../models/');
var BaseReminder = models.BaseReminder;
var Timeframe = models.Timeframe;
var Category = models.Category;
var baseReminderService = require('./baseDbService')(BaseReminder);

baseReminderService.findAll = function() {
  return BaseReminder.findAll({include: [Timeframe, Category]}).then(function(resp) {
    var baseReminders = resp.map(function(resp) {
      return resp.dataValues;
    });

    return baseReminders.map(function(baseReminder) {
      baseReminder.timeframeIds = baseReminder.Timeframes.map(function(timeframeResp) {
        return timeframeResp.dataValues.id;
      });
      baseReminder.timeframes = baseReminder.Timeframes.map(function(timeframeResp) {
        return timeframeResp.dataValues.name;
      });
      baseReminder.categoryName = baseReminder.Category.dataValues.name;
      delete baseReminder.Timeframes;
      delete baseReminder.Category;
      return baseReminder;
    });

  });
};

baseReminderService.findAllIncludingTimeframes = function() {
  return BaseReminder.findAll({include: Timeframe}).then(function(resp) {
    var baseReminders = resp.map(function(resp) {
      return resp.dataValues;
    });

    return baseReminders.map(function(baseReminder) {
      baseReminder.timeframes = baseReminder.Timeframes.map(function(timeframeResp) {
        return {
          id: timeframeResp.dataValues.id,
          name: timeframeResp.dataValues.name,
          type: timeframeResp.dataValues.type,
          formula: timeframeResp.dataValues.formula
        }
      });
      delete baseReminder.Timeframes;
      return baseReminder;
    })
  })
};

baseReminderService.findById = function(id) {
  return BaseReminder.findById(id, {include: [Timeframe, Category]}).then(function(resp) {
    if (!resp) {
      return [];
    }

    var baseReminder = resp.dataValues;

    baseReminder.timeframeIds = baseReminder.Timeframes.map(function(timeframeResp) {
      return timeframeResp.dataValues.id;
    });
    baseReminder.timeframes = baseReminder.Timeframes.map(function(timeframeResp) {
      return timeframeResp.dataValues.name;
    });
    baseReminder.categoryName = baseReminder.Category.dataValues.name;
    delete baseReminder.Timeframes;
    delete baseReminder.Category;
    return [baseReminder];

  });
};

baseReminderService.create = function(data) {
  var timeframes = data.timeframeIds;

  return BaseReminder.create(data).then(function(newBaseReminder) {
    var baseReminder = newBaseReminder.dataValues;
    return newBaseReminder.setTimeframes(timeframes).then(function() {
      baseReminder.timeframeIds = data.timeframeIds;
      return [baseReminder];
    });
  });
};

baseReminderService.update = function(id, data) {
  return BaseReminder.findById(id).then(function(baseReminder) {
    if (!baseReminder) {
      return Promise.resolve(false);
    }

    return baseReminder.update(data).then(function(updatedBaseReminder) {
      var baseReminder = updatedBaseReminder.dataValues;
      if (data.timeframeIds) {
        return updatedBaseReminder.setTimeframes(data.timeframeIds).then(function() {
          baseReminder.timeframeIds = data.timeframeIds;
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
