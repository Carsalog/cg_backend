module.exports = (req, res, next) => {
  /**
   * Password validator. Make sure that password exists
   * and password have a valid format
   */

  if (!req.body.password || typeof req.body.password !== "string") {
    return res.status(400).send({error: "Invalid password"})
  }
  next();
};