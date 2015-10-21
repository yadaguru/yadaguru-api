/*
 * Initialize and setup yadaguru database
 * TODO: Add options to clean db and other tooling
 */

var pg = require('pg');

var connectionString = process.env.DATABASE_URL ||
  'postgres://yadaguru:yadaguru@localhost:5432/yadaguru';

var tableQueries = { };
var tables = {
  'category': [
    'id SERIAL PRIMARY KEY',
    'name TEXT UNIQUE'
  ],
  'faq': [
    'id SERIAL PRIMARY KEY',
    'content TEXT'
  ],
  'setting': [
    'id SERIAL PRIMARY KEY',
    'summer_cut_off_month SMALLINT',
    'summer_cut_off_day SMALLINT'
  ],
  'test_date': [
    'id SERIAL PRIMARY KEY',
    'test_date DATE',
    'registration_date DATE',
    'test_type TEXT'
  ],
  'user_account': [
    'id SERIAL PRIMARY KEY',
    'username TEXT',
    'salt TEXT',
    'hashed_password TEXT',
    'roles TEXT[]'
  ],
  'test_message': [
    'id SERIAL PRIMARY KEY',
    'sat_message TEXT',
    'sat_detail TEXT',
    'act_message TEXT',
    'act_detail TEXT',
    'test_category TEXT REFERENCES category(name)'
  ],
  'reminder': [
    'id SERIAL PRIMARY KEY',
    'name TEXT',
    'message TEXT',
    'detail TEXT',
    'late_message TEXT',
    'late_detail TEXT',
    'category TEXT REFERENCES category(name)',
    'timeframes TEXT'
  ]
};

var makeQuery = function(table, columns) {
  return 'CREATE TABLE ' + table + ' (' + columns + ')';
};

for (var table in tables) {
  if (tables.hasOwnProperty(table)) {
    var columns = tables[table].join(', ');
    var newQuery = makeQuery(table, columns);
    tableQueries[table] = (newQuery);
  }
}

var query = function(queryString, callback) {
  pg.connect(connectionString, function(err, client, done) {
    client.query(queryString, function(err) {
      if (err) {
        console.log('ERROR: ' + queryString + '\n\r' + err);
      } else {
        console.log('SUCCESS: ' + queryString);
      }
      if (callback) {
        callback();
      }
      done();
    });
  });
};

query(tableQueries.category, function() {
  query(tableQueries.test_message);
  query(tableQueries.reminder);
});
query(tableQueries.faq);
query(tableQueries.setting);
query(tableQueries.test_date);
query(tableQueries.user_account);

console.log('It make take a few seconds to dispose of queries');
pg.end();
