const {User} = require("../models/users");
const {Post} = require("../models/posts");
const {Transmission} = require("../models/transmission");
const {State} = require("../models/states");
const {City} = require("../models/cities");

module.exports = async function (req, res, next) {
  /**
   * Id validator middleware. Checks that id is valid, else return 404 error
   */

  if (!(await State.getById(req.body.state)))
    return res.status(404).send({error: "Cannot find this state"});
  if (!(await City.getById(req.body.city)))
    return res.status(404).send({error: "Cannot find this city"});
  if (!(await Transmission.getById(req.body.transmission)))
    return res.status(404).send({error: "Cannot find this transmissions type"});

  const user = await User.getById(req.user._id);
  if (!user) return res.status(404).send({error: "Cannot find this user"});

  const post = await Post.getById(req.params.id);
  if (!post) return res.status(404).send({error: "Cannot find this post"});

  // If user isn't author and isn't admin return error message
  if (!user.su && String(user._id) !== String(post.author._id))
    return res.status(403).send({error: "You cannot edit this post"});

  const city = await City.getById(req.body.city);
  if (String(city.state) !== req.body.state)
    return res.status(400).send({error: "City and state doesn't match"});

  next();
};