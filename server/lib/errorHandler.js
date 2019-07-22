const winston = require("winston");


module.exports = function (err) {
  if (err) {
    console.error(err);
    winston.error(err);
  }
};
