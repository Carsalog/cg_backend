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

tag.statics.getById = function(_id) {
  /**
   * Get tag by id
   * @return Object:
   */
  return this.findById(_id).select("-__v");
};


tag.statics.getByName = function (name) {
  /**
   * Get tag by name
   * @return Object:
   */
  return this.findOne({name: name.toLowerCase(), }).select("-__v");
};

exports.Tag = mongoose.model(String(config.get("tags.tableName")), tag);
