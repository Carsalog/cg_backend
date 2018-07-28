module.exports = function (req, res, next) {
  if (!req.user.su) return res.status(403).send({error: "Access denied"});
  next();
};