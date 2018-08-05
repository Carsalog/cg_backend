module.exports = (req, res, next) => {

  if (!req.body.password || typeof req.body.password !== "string") {
    return res.status(400).send({error: "Invalid password"})
  }
  next();
};