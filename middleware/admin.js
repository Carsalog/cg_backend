module.exports = function (req, res, next) {
  /**
   * Checks that user is admin or return 403 error
   */
  if (!req.user.su) return res.status(403).send({error: "Access denied"});
  next();
};