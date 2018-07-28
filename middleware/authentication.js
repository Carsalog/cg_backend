const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {

  // Retrieve auth token
  const token = req.header("x-auth-token");

  // If token is undefended send error message
  if (!token) return res.status(401).send({error: "Access deny. No token provided"});

  // Try to retrieve user info from auth token
  try {
    req.user = jwt.verify(token, config.get("jwtPrivateKey"));
    next();
  } catch (e) {

    return res.status(400).send({error: "Invalid token"})
  }
};