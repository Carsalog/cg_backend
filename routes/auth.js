const Joi = require("joi");
const {User} = require("../models/users");
const {verify} = require("../lib/hash");
const express = require("express");
const router = express.Router();
const config = require("config");
const pwValidator = require("../middleware/pwValidator");
const valid = require("../middleware/valid");


router.post("/", [pwValidator, valid(validate)], async (req, res) => {
  /**
   * Create a new user and send user object to the client
   *
   * @return Object:
   */

  const user = await User.getByEmail(req.body.email);
  const msg = {error: "Invalid email or password"};

  // Make sure that user with given email is not already registered
  if (!user || !(await verify(req.body.password, user.password))) return res.status(400).send(msg);

  // Prepare jwt
  const token = user.generateAuthToken();

  // Return user object to a client
  return res.send({token: token});
});

function validate(req) {
  /**
   * Validates client credentials if credentials is invalid returns error
   * @type {{email: *, password: *}}
   * @return Object:
   */
  const schema = {
    email: Joi.string().email().min(6).max(256).required().email(),
    password:  new Joi.password(config.get("users.password"))
  };
  return Joi.validate(req, schema);
}

module.exports = router;