const _ = require("lodash");
const {validate, getByEmail, create, getById, update, remove} = require("../models/users");
const express = require("express");
const router = express.Router();
const config = require("config");
const auth = require("../middleware/authentication");
const idValidator = require("../middleware/idValidator");




module.exports = router;