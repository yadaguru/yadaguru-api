var massive          = require('massive'),
    sql              = require('../../sql'),
    connectionString = 'postgres://postgres:postgres@localhost:5432/yadaguru';

var Helpers = function(){
  this.db={};
  this.initDb = function(next){

    var sqlString = sql.getSql();
    massive.connect({connectionString : connectionString}, function(err,res){
      this.db = res;
      this.db.run(sqlString, [], next);
    }.bind(this));
  };

  this.register = function(args, next){
    this.db.membership.register([args.email, args.password, args.confirm], function(err,res){
      next(err,res[0]);
    });
  };

};

module.exports = new Helpers();
