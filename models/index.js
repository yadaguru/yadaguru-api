var fs = require('fs');
var path = require('path');
var basename  = path.basename(module.filename);
var Sequelize = require('sequelize');
var clone = require('clone');
var config = require('../config/sequelize.json').development;
var database = process.env.DATABASE_URL || 'postgres://yadaguru:yadaguru@localhost:5432/yadaguru';

var sequelize = new Sequelize(database, clone(config));
var db        = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename);
  })
  .forEach(function(file) {
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
