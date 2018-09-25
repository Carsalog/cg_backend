const Joi = require("joi");
const config = require("config");
const {Zip} = require("../models/zips");
const {State} = require("../models/states");
const {City} = require("../models/cities");
const _ = require("lodash");
const controller = {};

module.exports = controller;