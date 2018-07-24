const Joi = require("joi");
const {getByEmail} = require("../models/users");
const {verify} = require("../lib/hash");
const express = require("express");
const router = express.Router();
const config = require("config");


router.post("/", async (req, res) => {
  /**
   * Create a new user and send user object to the client
   *
   * @return Object:
   */

  // Make sure that password is a valid format
  if (!req.body.password || typeof req.body.password !== "string") {
    return res.status(400).send({error: "Invalid password"})
  }

  // Make sure  that data is valid
  const { error } = validate(req.body);
  if (error) return res.status(400).send({error: error.details[0].message});

  const user = await getByEmail(req.body.email);
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
    email: Joi.string().min(6).max(256).required().email(),
    password:  new Joi.password(config.get("users.password"))
  };
  return Joi.validate(req, schema);
}

module.exports = router;