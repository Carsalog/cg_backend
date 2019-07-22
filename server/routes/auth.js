const Joi = require("joi");
const express = require("express");
const router = express.Router();
const config = require("config");
const passport = require("passport");
const GooglePlusStrategy = require('passport-google-plus');
const {User} = require("../models/users");
const {verify} = require("../lib/hash");
const pwValidator = require("../middleware/pwValidator");
const valid = require("../middleware/valid");

passport.use(new GooglePlusStrategy({
    clientId: config.get("googleClientId"),
    clientSecret: config.get("googleKey")
  },
  function(tokens, profile, done) {
    // Create or update user, call done() when complete...
    done(null, profile, tokens);
  }
));


passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});


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


router.post("/google", passport.authenticate("google", null, null), async (req, res) => {

  if (!req.user) res.status(404).send({error: "Cannot find this user"});
  const {email, name} = req.user;
  if (email && email.length > 0) {
    let user = await User.getByEmail(email);
    if (!user) {
      user = {};
      user.email = email;
      user.firstName = name.givenName;
      user.lastName = name.familyName;
      user.phone = "";
      user.su = false;
      return res.send(user);
    }
    return res.send({token: user.generateAuthToken()});
  }

  return res.status(400).send({error: "Cannot retrieve email from Google account"})
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