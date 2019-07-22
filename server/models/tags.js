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

tag.statics.delById = function (_id) {
  /**
   * Remove a car type
   * @return Object:
   */
  return this.findByIdAndRemove(_id);
};


exports.Tag = mongoose.model(String(config.get("tags.tableName")), tag);


exports.validate = function (tag) {
  /**
   * Validation
   * @return Function:
   * @type {{_id: *, name: *}}
   */
  const schema = {
    _id: Joi.objectId(),
    name: Joi.string().min(config.get("tags.name.min")).max(config.get("tags.name.max")).required()
  };
  return Joi.validate(tag, schema);
};