const mongoose = require("mongoose");
const Joi = require("joi");
const config = require("config");
const {getCurrentYear} = require("../lib/tools");
const currentYear = getCurrentYear();

const car  = new mongoose.Schema({
  vin: {
    type: String,
    trim: true,
    uppercase: true,
    required: true,
    unique: true
  },
  make: {
    type: String,
    default: null
  },
  model: {
    type: String,
    default: null
  },
  type: {
    type: String,
    default: null,
    lowercase: true
  },
  fuel: {
    type: String,
    default: null,
    lowercase: true
  },
  year: {
    type: Number,
    required: true,
    min: config.get("cars.year.min"),
    max: currentYear
  }
});

exports.Car = mongoose.model(String(config.get("cars.tableName")), car);
