'use strict';
var logLevel = process.env.LOG_LEVEL || 'debug';
var JL = require('jsnlog').JL;
var jsnlogNodejs = require('jsnlog-nodejs').jsnlog_nodejs;
var winston = require('winston');

// JSLogger raises "fatal" errors, which winston's colorize doesn't support out of the box
winston.addColors({fatal: 'red'});

// Set errors to be logged both to the console and to the log file
JL().setOptions({appenders: [
  new winston.transports.Console({
    level: 'debug',
    colorize: true
  }),
  new winston.transports.File({
    filename: 'logs/yadaguru-api.log',
    level: logLevel
  })
]});

/**
 * Middleware function for logging errors. Logs the error with JSLog, and sends and empty response.
 * Called by a POST to /jsnlog.logger
 * @param {object} req - the Express request object
 * @param {object} res - the Express response object
 */
module.exports = function(req, res) {
  jsnlogNodejs(JL, req.body);
  res.send('');
};