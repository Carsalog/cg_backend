const express = require("express");
const {getById, getByPage, getByName, validate, create, update, remove} = require("../models/makes");
const router = express.Router();
const auth = require("../middleware/authentication");
const su = require("../middleware/admin");
const validator = require("../middleware/validator");
const idValidator = require("../middleware/idValidator");
const _ = require("lodash");


router.get("/", validator, async (req, res) => {
  /**
   * Get amount of car makes by page
   * @return Object:
   */
  res.send(await getByPage(req.params.page, req.params.amount));
});

module.exports = router;