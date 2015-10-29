module.exports = function(sequelize, DataTypes) {
  var Reminder = sequelize.define("Reminder", {
    // Do not need to define created_at, edited_at, deleted_at or id
    name: { type: DataTypes.TEXT, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    detail: { type: DataTypes.TEXT, allowNull: false },
    lateMessage: { type: DataTypes.TEXT, allowNull: false, field: 'late_message' },
    lateDetail: { type: DataTypes.TEXT, allowNull: false, field: 'late_detail' },
    category: { type: DataTypes.TEXT, allowNull: false, references: { model: 'Category', key: 'name' } },
    timeframes: { type: DataTypes.TEXT, allowNull: false }
  }, {
    // Adds createdAt and updatedAt timestamps to the model.
    timestamps: true,

    // Calling destroy will not delete the model, but instead set a deletedAt timestamp
    // if this is true. Needs timestamps=true to work.
    paranoid: true,

    // don't use camelcase for automatically added attributes but underscore style
    // so updatedAt will be updated_at
    underscored: true,

    // disable the modification of tablenames; By default, sequelize will automatically
    // transform all passed model names (first parameter of define) into plural.
    // if you don't want that, set the following
    freezeTableName: true,

    // define the table's name
    tableName: 'reminder',
    instanceMethods: {
      clean: function() {
        delete this.dataValues.created_at;
        delete this.dataValues.updated_at;
        delete this.dataValues.deleted_at;
      }
    }
  });
  return Reminder;
};
