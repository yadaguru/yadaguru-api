var fs        = require("fs");
var Sequelize = require("sequelize");
var config = require('../config')[process.env.DEPLOY_MODE];

var models = function() {

  var db = {};
  var sequelize = new Sequelize(config.connectionString, config.sequelizeOptions);

  fs
    .readdirSync(__dirname)
    .filter(function(file) {
      return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
      var model = sequelize.import(file);
      db[model.name] = model;
    });

  Object.keys(db).forEach(function(modelName) {
    if ("associate" in db[modelName]) {
      db[modelName].associate(db);
    }
  });

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;

  return db;

};

module.exports = models();
