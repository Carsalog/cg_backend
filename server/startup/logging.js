const winston = require("winston");
// require("winston-mongodb");
require("express-async-errors");

module.exports = function () {
  // Handling uncaught exceptions
  winston.exceptions.handle(
    new winston.transports.Console({colorize: true, prettyPrint: true}),
    new winston.transports.File({filename: "handleException.log"}));

  // Handling unhandled rejection
  process.on("unhandledRejection", error => {
    console.log(error);
    throw error
  });

  // Handling app error exceptions
  winston.add(new winston.transports.File({filename: "logfile.log"}));
  // winston.add(new winston.transports.MongoDB({db: config.get("db")}));
};