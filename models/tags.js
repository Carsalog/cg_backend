const mongoose = require("mongoose");
const Joi = require("joi");
const config = require("config");

const tag = new mongoose.Schema({
  name: {
    type: String,
    minlength: config.get("tags.name.min"),
    maxlength: config.get("tags.name.max"),
    lowercase: true,
    trim: true,
    required: true
  }
});

export default mongoose.model(String(config.get("tags.tableName")), tag);
