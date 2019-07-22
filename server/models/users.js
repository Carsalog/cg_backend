const Joi = require("joi");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const config = require("config");
const mongoose = require("mongoose");
const {hash} = require("../lib/hash");

// Define mongoose schema
const user = new mongoose.Schema({
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


user.methods.generateAuthToken = function () {
  /**
   * Generates auth token for current client
   *
   * @return Promise:
   */
  return jwt.sign(_.pick(this, config.get("users.returns")), config.get("jwtPrivateKey"));
};

user.statics.getById = function (_id) {
  /**
   * Get user by user id
   *
   * @return Promise:
   */
  return this.findById(_id).select("-password -__v");
};

user.statics.getByEmail = function (email) {
  /**
   * Get user by email
   *
   * @return Promise:
   */
  return this.findOne({email: email});
};

user.statics.create = async function (user) {
  /**
   * Create a new user
   *
   * @type {Model}
   * @return Promise:
   */
  return this({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    password: await hash(user.password),
    su: false
  }).save();
};

user.statics.update = async function (_id, usr) {
  /**
   * Update user if user existing else return null
   *
   * @return Promise;
   */

  let _user = await this.findById(_id);

  if (!_user) return null;

  _user.firstName = usr.firstName;
  _user.lastName = usr.lastName;
  _user.phone = usr.phone;
  _user.email = usr.email;
  _user.password = await hash(usr.password);

  await _user.save();
  return this.findById(_id);
};

user.statics.delById = function (objectId) {
  /**
   * Remove a user profile
   *
   * @return Promise:
   */
  return this.findByIdAndRemove(objectId);
};

// Create user model
exports.User = mongoose.model(String(config.get("users.tableName")), user);

exports.validate = function (user) {
  /**
   * Validate user data from a client
   *
   * @type {{firstName: *, lastName: *, email: *, phone: *, password: *, su: *}}
   * @return Object:
   */
  const schema = {
    firstName: Joi.string().min(config.get("users.firstName.min"))
      .max(config.get("users.firstName.max")).required(),
    lastName: Joi.string().min(config.get("users.lastName.min"))
      .max(config.get("users.lastName.max")).required(),
    email: Joi.string().min(config.get("users.email.min"))
      .max(config.get("users.email.max")).required().email(),
    phone: Joi.string().min(config.get("users.phone.min"))
      .max(config.get("users.phone.max")).required(),
    password: new Joi.password(config.get("users.password")),
    su: Joi.boolean()
  };

  return Joi.validate(user, schema);
};
