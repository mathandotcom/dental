var moment = require('moment');

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
var currentdate = moment().format('YMMDD');

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(
    //label({ label: 'right meow!' }),
    timestamp(),
    myFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({filename: __dirname + `/logs/daily_${currentdate}.log`})
  ]
});

module.exports = logger;