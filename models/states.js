const mongoose = require("mongoose");
const Joi = require("joi");
const config = require("config");

const state = new mongoose.Schema({
  name: {
    type: String,
    minlength: config.get("states.name.min"),
    maxlength: config.get("states.name.max"),
    lowercase: true,
    required: true,
    unique: true,
    trim: true
  },
  abbreviation: {
    type: String,
    minlength: config.get("states.abbreviation.min"),
    maxlength: config.get("states.abbreviation.max"),
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  cities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: String(config.get("cities.tableName"))
  }],
});

exports.State = mongoose.model(String(config.get("states.tableName")), state);
