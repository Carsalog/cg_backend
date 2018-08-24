const mongoose = require("mongoose");
const Joi = require("joi");
const config = require("config");


const transmission = new mongoose.Schema({
  type: {
    type: String,
    minlength: config.get("transmission.type.min"),
    maxlength: config.get("transmission.type.max"),
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  }
});
