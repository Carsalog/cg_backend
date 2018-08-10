const express = require("express");
const error = require("../middleware/error");
const cities = require("../routes/cities");
const states = require("../routes/states");
const auth = require("../routes/auth");
const users = require("../routes/users");
const home = require("../routes/home");
const cors = require("cors");


module.exports = function (app) {

  // Template engine
  app.set('view engine', 'ejs');
  app.set('views', './public');

  // Middleware
  app.use(express.json({limit: '50mb'}));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(express.static('public'));
  app.use(cors());
  app.disable('x-powered-by');

  // Routs
  app.use('/api/cities', cities);
  app.use('/api/states', states);
  app.use('/api/auth', auth);
  app.use('/api/users', users);
  app.use('/', home);
  app.use(error);
};