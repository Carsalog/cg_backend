const mongoose = require("mongoose");
const Joi = require("joi");
const config = require("config");
const {getCurrentYear} = require("../lib/tools");
const currentYear = getCurrentYear();


const posts = new mongoose.Schema({
  description: {
    type: String,
    min: config.get("posts.description.min"),
    max: config.get("posts.description.max"),
    required: true
  },
  state: {
    type: mongoose.Schema.Types.ObjectId,
    ref: String(config.get("states.tableName")),
    required: true
  },
  city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: String(config.get("cities.tableName")),
    required: true
  },
  make: {
    type: mongoose.Schema.Types.ObjectId,
    ref: String(config.get("makes.tableName")),
    required: true
  },
  model: {
    type: mongoose.Schema.Types.ObjectId,
    ref: String(config.get("models.tableName")),
    required: true
  },
  year: {
    type: Number,
    required: true,
    min: config.get("cars.year.min"),
    max: currentYear
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: String(config.get("cars.tableName")),
    required: true
  },
  transmission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: config.get("transmission.tableName"),
    default: null
  },
  images: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: String(config.get("images.tableName"))
  }],
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: String(config.get("tags.tableName"))
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: config.get("users.tableName"),
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  mileage: {
    type: Number,
    min: config.get("posts.mileage.min"),
    max: config.get("posts.mileage.max"),
    required: true
  },
  price: {
    type: Number,
    min: config.get("posts.price.min"),
    max: config.get("posts.price.max"),
    required: true
  }
});


exports.Post = mongoose.model(String(config.get("posts.tableName")), posts);
