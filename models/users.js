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

userSchema.methods.generateAuthToken = function () {
  /**
   * Generates auth token for current client
   *
   * @return Promise:
   */
  return jwt.sign(_.pick(this, config.get("users.returns")), config.get("jwtPrivateKey"));
};

// Create user model
const User = mongoose.model(String(config.get("users.tableName")), userSchema);

function validateUser(user) {
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
}

async function getByEmail(email) {
  /**
   * Get user by email
   *
   * @return Promise:
   */
  return await User.findOne({email: email});
}

async function create(user) {
  /**
   * Create a new user
   *
   * @type {Model}
   * @return Promise:
   */
  const newUser = new User({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    password: await hash(user.password),
    su: false
  });

  return await newUser.save();
}

async function update(_id, user) {
  /**
   * Update user if user existing else return null
   *
   * @return Promise;
   */
  let _user = await User.findById(_id);

  if (!_user) return null;

  _user.firstName = user.firstName;
  _user.lastName = user.lastName;
  _user.phone = user.phone;
  _user.password = await hash(user.password);
  return await _user.save();
}

async function remove(objectId) {
  /**
   * Remove a user profile
   *
   * @return Promise:
   */
  return await User.findByIdAndRemove(objectId);
}

async function getById(id) {
  /**
   * Get user by user id
   *
   * @return Promise:
   */
  return await User.findById(id).select("-password -__v");
}

exports.User = User;
exports.validate = validateUser;
exports.getByEmail = getByEmail;
exports.create = create;
exports.getById = getById;
exports.update = update;
exports.remove = remove;
