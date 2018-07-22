const Joi = require("joi");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const config = require("config");
const mongoose = require("mongoose");
const {hash} = require("../lib/hash");

// Define mongoose schema
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minlength: config.get("users.firstName.min"),
    maxlength: config.get("users.firstName.max")
  },
  lastName: {
    type: String,
    required: true,
    minlength: config.get("users.lastName.min"),
    maxlength: config.get("users.lastName.max")
  },
  email: {
    type: String,
    required: true,
    minlength: config.get("users.email.min"),
    maxlength: config.get("users.email.max"),
    unique: true
  },
  phone: {
    type: String,
    required: true,
    minlength: config.get("users.phone.min"),
    maxlength: config.get("users.phone.max")
  },
  password: {
    type: String,
    required: true,
    minlength: config.get("users.hash.min"),
    maxlength: config.get("users.hash.max")
  },
  su: {
    type: Boolean,
    default: false
  }
});
