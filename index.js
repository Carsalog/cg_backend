const winston = require("winston");
const express = require("express");
const app = express();
const PORT = process.env.port || 3000;

const server = app.listen(PORT, () => winston.info(`Server run on http://127.0.0.1:${PORT}`));

module.exports = server;