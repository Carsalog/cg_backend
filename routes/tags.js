const express = require("express");
const {Tag, validate} = require("../models/tags");
const router = express.Router();
const auth = require("../middleware/authentication");
const su = require("../middleware/admin");
const _ = require("lodash");
const validator = require("../middleware/validator");
const idValidator = require("../middleware/idValidator");
const valid = require("../middleware/valid");


module.exports = router;