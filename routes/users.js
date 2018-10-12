const _ = require("lodash");
const {User, validate} = require("../models/users");
const express = require("express");
const router = express.Router();
const config = require("config");
const auth = require("../middleware/authentication");
const idValidator = require("../middleware/idValidator");
const pwValidator = require("../middleware/pwValidator");
const valid = require("../middleware/valid");


router.get("/me", auth, async (req, res) => {
  /**
   * Returns user info to a client if auth token is valid
   *
   * @return Object:
   */
  return res.send(await User.getById(req.user._id));
});

router.get("/:email", async (req, res) => {

  return res.send(Boolean(await User.getByEmail(req.params.email)));
});

router.post("/", [pwValidator, valid(validate)], async (req, res) => {
  /**
   * Create a new user and send user object to the client
   *
   * @return object:
   */

  // Make sure that user with given email is not already registered
  if (await User.getByEmail(req.body.email)) return res.status(400).send({error: "User already registered"});

  // Return user object to a client
  return res.status(201).send(_.pick(await User.create(req.body), config.get("users.returns")));
});

router.put("/:id", [pwValidator, valid(validate)], auth, async (req, res) => {
  /**
   * Update user info if user is logged and send valid data and
   * send updated user object to a client
   *
   * @return Object:
   */

  const user = await User.update(req.params.id, req.body);

  if (!user) return res.status(404).send({error: "Cannot find this user"});

  return res.send(_.pick(user, config.get("users.returns")));
});

router.delete("/:id", [auth, idValidator], async (req, res) => {
  /**
   * Removes a user profile. If given user id exists returns info message,
   * else returns error message.
   *
   * @return Object:
   */

  // Try to find the car model
  const user = await User.delById(req.params.id);
  if (!user) return res.status(404).send({error: "Cannot find the user"});

  // Return response
  return res.send({info: `Dear ${user.firstName} ${user.lastName}, your profile was removed successfully`});
});

module.exports = router;