const mongoose = require("mongoose");
const Joi = require("joi");
const config = require("config");

const makeSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: config.get("makes.name.min"),
    maxlength: config.get("makes.name.max"),
    required: true,
    unique: true,
    trim: true
  }
});
