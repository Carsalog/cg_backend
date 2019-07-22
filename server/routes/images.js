const express = require("express");
const config = require("config");
const fs = require('fs');
const {Image, validate} = require("../models/images");
const {Post} = require("../models/posts");
const auth = require("../middleware/authentication");
const su = require("../middleware/admin");
const valid = require("../middleware/valid");
const idValidator = require("../middleware/idValidator");
const _ = require("lodash");
const multer = require("multer");
const img = require("../middleware/images");
const {unionImages} = require("../lib/tools");
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });


router.get("/by/car/:id", [auth, idValidator], async (req, res) => {
  /**
   * Returns cars images
   */
  const post = await Post.getById(req.params.id);
  if (!post) return res.status(404).send({error: "Cannot find this post"});
  else return res.status(200).send(post.images);
});

router.post("/by/post/:id", [auth, upload.array("images", 10), img], async (req, res) => {
  /**
   * Add a new image
   * @return Object:
   */

  const post = await Post.findById(req.params.id);

  if (!post) return res.status(404).send({error: "Cannot find the post"});

  const preparedImages = unionImages(req.images, req.user._id, post._id);

  if (!req.images || req.images.length === 0) {
    return res.status(400).send({error: "Cannot finish the operation"});
  }

  try {

    const result = await Image.collection.insertMany(preparedImages);

    for (let i = 0; i < result.insertedCount; i++) {
      post.images.push(result.insertedIds[`${i}`]);
      await post.save();
    }

    const response = await Post.findById(req.params.id);
    console.log(response);

    // Send response to a client
    return res.status(201).send(response.images);
  } catch (e) {
    console.error("ERROR: ", e);
    await Image.removeAll(preparedImages);
    return res.status(500).send({error: "Cannot save this images"});
  }
});


router.delete("/:id", [auth, idValidator], async (req, res) => {

  const image = await Image.getById(req.params.id);
  if (!image) return res.status(404).send({error: "Cannot find this image"});

  await fs.unlink(image.url);
  const post = await Post.getById(image.post);
  post.images = post.images.filter(img => img._id !== image._id);
  await post.save();

  await Image.deleteById(image._id);

  return res.send(post.images);
});


module.exports = router;