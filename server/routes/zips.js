const express = require("express");
const {validate} = require("../models/zips");
const validateZipId = require("../middleware/validateZipId");
const router = express.Router();
const auth = require("../middleware/authentication");
const su = require("../middleware/admin");
const valid = require("../middleware/valid");
const locValidation = require("../middleware/locValidation");
const controller = require("../controllers/zips");


router.get("/:id", validateZipId, controller.get);

router.post("/", [auth, su, locValidation], controller.post);

router.put('/:id', [auth, su, validateZipId, locValidation, valid(validate)], controller.put);

router.delete("/:id", [auth, su, validateZipId], controller.delete);


module.exports = router;