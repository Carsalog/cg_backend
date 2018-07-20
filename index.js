const winston = require("winston");
const express = require("express");
const app = express();
const PORT = process.env.port || 3000;

require("./startup/logging")();
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/config")();
require("./startup/validation")();
require("./startup/middleware")(app);


const server = app.listen(PORT, () => winston.info(`Server run on http://127.0.0.1:${PORT}`));

module.exports = server;