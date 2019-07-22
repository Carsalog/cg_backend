const app = require("./loader");
const winston = require("winston");
const config = require("config");
const PORT = process.env.PORT || config.get("port");

app.listen(config.get("port"), () => winston.info(`Server run on http://127.0.0.1:${PORT}`));