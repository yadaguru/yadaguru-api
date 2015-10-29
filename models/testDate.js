module.exports = function(sequelize, DataTypes) {
  var TestDate = sequelize.define("TestDate", {
    // Do not need to define created_at, edited_at, deleted_at or id
    testDate: { type: DataTypes.DATE, allowNull: false, field: 'test_date' },
    registrationDate: { type: DataTypes.DATE, allowNull: false, field: 'registration_date' },
    testType: { type: DataTypes.TEXT, allowNull: false, field: 'test_type' }
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
    tableName: 'test_date',
    instanceMethods: {
      clean: function() {
        delete this.dataValues.created_at;
        delete this.dataValues.updated_at;
        delete this.dataValues.deleted_at;
      }
    }
  });
  return TestDate;
};
