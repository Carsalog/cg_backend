const app = require("./loader");
const winston = require("winston");
const config = require("config");


app.listen(config.get("port"), () => winston.info(`Server run on http://127.0.0.1:${config.get("port")}`));