const mongoose = require("mongoose");
const Joi = require("joi");
const config = require("config");
const {removeImages} = require("../lib/tools");
const winston = require("winston");

const image = new mongoose.Schema({
  url: {
    type: String,
    minlength: config.get("images.url.min"),
    maxlength: config.get("images.url.max"),
    required: true,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: config.get("users.tableName"),
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: config.get("posts.tableName")
  }
});

image.statics.getById = function (_id) {
  return this.findById(_id).select("-__v");
};

image.statics.getByPostId = function (_id) {
  return this.find({post: _id}).select("-__v");
};

image.statics.new = function (img) {
  return this.create(img).save();
};

image.statics.deleteById = function (_id) {
  return this.findByIdAndRemove(_id);
};

image.statics.removeAll = function (images) {

  const urls = images.map(item => {return item.url});
  Promise.all([
    removeImages(urls),
    this.deleteMany({url: {$in: urls}})
  ])
    .then(d => console.log(d))
    .catch(err => winston.error(err))
};

exports.Image = mongoose.model(String(config.get("images.tableName")), image);

exports.validate = (object) => {
  /**
   * Validate model fields
   * @return object:
   */
  const schema = {
    _id: Joi.objectId(),
    url: Joi.string().min(config.get("images.url.min")).max(config.get("images.url.max")),
    post: Joi.objectId()
  };
  return Joi.validate(object, schema);
};
