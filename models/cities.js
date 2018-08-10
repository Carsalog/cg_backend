const mongoose = require("mongoose");
const Joi = require("joi");
const config = require("config");

const city = new mongoose.Schema({
  name: {
    type: String,
    minlength: config.get("cities.name.min"),
    maxlength: config.get("cities.name.max"),
    required: true,
    lowercase: true,
    unique: true,
    trim: true
  },
  state: {
    type: mongoose.Schema.Types.ObjectId,
    ref: String(config.get("states.tableName"))
  },
});


exports.City = mongoose.model(String(config.get("cities.tableName")), city);

