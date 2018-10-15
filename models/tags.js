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

tag.statics.create = function (newTag) {
  /**
   * Create a new tag
   * @return Object:
   */

  return new this(newTag).save();
};

tag.statics.update = async function (obj, _id) {
  /**
   * Update a tag
   * @return Object:
   */

  const current = await this.findById(_id);
  if (!current) return null;

  // Update and return a car type
  current.name = obj.name;
  return current.save();
};

exports.Tag = mongoose.model(String(config.get("tags.tableName")), tag);
