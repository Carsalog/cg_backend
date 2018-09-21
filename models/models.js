const mongoose = require("mongoose");
const Joi = require("joi");
const config = require("config");

const model = new mongoose.Schema({
  name: {
    type: String,
    minlength: config.get("models.name.min"),
    maxlength: config.get("models.name.max"),
    required: true,
    unique: true,
    trim: true
  },
  make: {
    type: mongoose.Schema.Types.ObjectId,
    ref: String(config.get("makes.tableName"))
  },
});


exports.Model = mongoose.model(String(config.get("models.tableName")), model);


