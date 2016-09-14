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
    }
  }, {
    classMethods: {
      associate: function(models) {
        Reminder.belongsTo(models.School, {
          onDelete: 'cascade',
          foreignKey: {
            name: 'schoolId',
            allowNull: false
          }
        });
        Reminder.belongsTo(models.User, {
          onDelete: 'cascade',
          foreignKey: {
            name: 'userId',
            allowNull: false
          }
        });
        Reminder.belongsTo(models.BaseReminder, {
          onDelete: 'cascade',
          foreignKey: {
            name: 'baseReminderId',
            allowNull: false
          }
        })
      }
    }
  });
  return Reminder;
};
