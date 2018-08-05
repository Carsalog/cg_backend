const winston = require("winston");

module.exports = function (err, req, res, next) {

  // Add error to the log file
  winston.error(err);
  console.error(err);
  res.status(500).send({error: "Oops... Something's wrong"})
};