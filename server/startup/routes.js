const express = require("express");
const cors = require("cors");
const passport = require("passport");
const error = require("../middleware/error");
const cars = require("../routes/cars");
const images = require("../routes/images");
const tags = require("../routes/tags");
const models = require("../routes/models");
const makes = require("../routes/makes");
const posts = require("../routes/posts");
const zips = require("../routes/zips");
const transmission = require("../routes/transmission");
const cities = require("../routes/cities");
const states = require("../routes/states");
const auth = require("../routes/auth");
const users = require("../routes/users");
const home = require("../routes/home");
const search = require("../routes/search");


module.exports = function (app) {

  // Template engine
  app.set('view engine', 'ejs');
  app.set('views', './public');

  // Middleware
  app.use(express.json({limit: '50mb'}));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(express.static('public'));
  app.use(require('cookie-parser')());
  app.use(cors());
  app.disable('x-powered-by');
  app.use(passport.initialize());
  app.use(passport.session());

  // Routs
  app.use('/api/cars', cars);
  app.use('/api/images', images);
  app.use('/api/tags', tags);
  app.use('/api/models', models);
  app.use('/api/makes', makes);
  app.use('/api/posts', posts);
  app.use('/api/zips', zips);
  app.use('/api/transmissions', transmission);
  app.use('/api/cities', cities);
  app.use('/api/states', states);
  app.use('/api/auth', auth);
  app.use('/api/users', users);
  app.use('/api/search', search);
  app.use('/', home);
  app.use(error);
};