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
    'name TEXT UNIQUE',
    'updated_at TIMESTAMPTZ',
    'created_at TIMESTAMPTZ',
    'deleted_at TIMESTAMPTZ'
  ],
  'faq': [
    'id SERIAL PRIMARY KEY',
    'content TEXT',
    'updated_at TIMESTAMPTZ',
    'created_at TIMESTAMPTZ',
    'deleted_at TIMESTAMPTZ'
  ],
  'setting': [
    'id SERIAL PRIMARY KEY',
    'summer_cut_off_month SMALLINT',
    'summer_cut_off_day SMALLINT',
    'updated_at TIMESTAMPTZ',
    'created_at TIMESTAMPTZ',
    'deleted_at TIMESTAMPTZ'
  ],
  'test_date': [
    'id SERIAL PRIMARY KEY',
    'test_date DATE',
    'registration_date DATE',
    'test_type TEXT',
    'updated_at TIMESTAMPTZ',
    'created_at TIMESTAMPTZ',
    'deleted_at TIMESTAMPTZ'
  ],
  'user_account': [
    'id SERIAL PRIMARY KEY',
    'username TEXT',
    'salt TEXT',
    'hashed_password TEXT',
    'roles TEXT[]',
    'updated_at TIMESTAMPTZ',
    'created_at TIMESTAMPTZ',
    'deleted_at TIMESTAMPTZ'
  ],
  'test_message': [
    'id SERIAL PRIMARY KEY',
    'sat_message TEXT',
    'sat_detail TEXT',
    'act_message TEXT',
    'act_detail TEXT',
    'test_category TEXT REFERENCES category(name)',
    'updated_at TIMESTAMPTZ',
    'created_at TIMESTAMPTZ',
    'deleted_at TIMESTAMPTZ'
  ],
  'reminder': [
    'id SERIAL PRIMARY KEY',
    'name TEXT',
    'message TEXT',
    'detail TEXT',
    'late_message TEXT',
    'late_detail TEXT',
    'category TEXT REFERENCES category(name)',
    'timeframes TEXT',
    'updated_at TIMESTAMPTZ',
    'created_at TIMESTAMPTZ',
    'deleted_at TIMESTAMPTZ'
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
