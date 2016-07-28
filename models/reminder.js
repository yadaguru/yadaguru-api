'use strict';
module.exports = function(sequelize, DataTypes) {
  var Reminder = sequelize.define('Reminder', {
    timeframe: {
      allowNull: false,
      type: DataTypes.STRING
    },
    dueDate: {
      allowNull: false,
      type: DataTypes.DATE
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING
    },
    message: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    detail: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    lateMessage: {
      allowNull: true,
      type: DataTypes.TEXT
    },
    lateDetail: {
      allowNull: true,
      type: DataTypes.TEXT
    }
  }, {
    classMethods: {
      associate: function(models) {
        Reminder.belongsTo(models.School, {onDelete: 'cascade'});
      }
    }
  });
  return Reminder;
};
