const debug = require('debug')("app:startup");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");

module.exports = function (app) {

  // Middleware
  app.use(helmet());
  app.use(compression());

  // Development environment settings
  if (app.get('env') === 'development') {
    app.use(morgan('tiny'));
    debug("Morgan enabled...");
  }
};