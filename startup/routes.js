const express = require("express");
const error = require("../middleware/error");
const auth = require("../routes/auth");
const users = require("../routes/users");
const home = require("../routes/home");


module.exports = function (app) {

  // Template engine
  app.set('view engine', 'ejs');
  app.set('views', './public');

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static('public'));

  // Routs
  app.use('/api/auth', auth);
  app.use('/api/users', users);
  app.use('/', home);
  app.use(error);
};