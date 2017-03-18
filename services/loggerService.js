var winston = require('winston');
var logLevel = process.env.LOG_LEVEL || 'debug';

var logger = new winston.Logger();

if (!process.env.NODE_ENV === 'test') {
  logger.add(winston.transports.File, {
    filename: 'logs/yadaguru-api.log',
    level: logLevel
  });

  logger.add(winston.transports.Console, {
    colorize: true, 
    level: 'debug'
  });
}

module.exports = logger;