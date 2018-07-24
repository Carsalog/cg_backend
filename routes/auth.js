const Joi = require("joi");
const {getByEmail} = require("../models/users");
const {verify} = require("../lib/hash");
const express = require("express");
const router = express.Router();


router.post("/", async (req, res) => {
  /**
   * Create a new user and send user object to the client
   *
   * @return Object:
   */

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

module.exports = router;