const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  /**
   * User authentication middleware. Read x-auth-token from headers, if token is doesn't set
   * returns error 401, if in headers invalid token return error with status code 400
   */

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