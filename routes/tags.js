const express = require("express");
const {Tag, validate} = require("../models/tags");
const router = express.Router();
const auth = require("../middleware/authentication");
const su = require("../middleware/admin");
const _ = require("lodash");
const validator = require("../middleware/validator");
const idValidator = require("../middleware/idValidator");
const valid = require("../middleware/valid");


router.get("/", validator, async (req, res) => {
  /**
   * Get amount of tags by page
   * @return Object:
   */

  res.send(await Tag.getByPage(req.params.page, req.params.amount))
});

module.exports = router;