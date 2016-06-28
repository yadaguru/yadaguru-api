var massive          = require('massive'),
    sql              = require('../../../sql'),
    connectionString = 'postgres://yadaguru:yadaguru@localhost:15432/yadaguru';

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
    this.db.membership.register([args.phone_number], function(err,res){
      if(err) console.log(err);
      next(err,res[0]);
    });
  };

};

module.exports = new Helpers();
