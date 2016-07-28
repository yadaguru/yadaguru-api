'use strict';
module.exports = function(sequelize, DataTypes) {
  var School = sequelize.define('School', {
    name: {
      allowNull: false,
      type: DataTypes.STRING
    },
    dueDate: {
      allowNull: false,
      type: DataTypes.DATE
    },
    isActive: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    classMethods: {
      associate: function(models) {
        School.belongsTo(models.User, {onDelete: 'cascade'});
        School.hasMany(models.Reminder);
      }
    }
  });
  return School;
};
