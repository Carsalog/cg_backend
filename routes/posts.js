const express = require("express");
const {validate, validatePUT} = require("../models/posts");
const router = express.Router();
const auth = require("../middleware/authentication");
const su = require("../middleware/admin");
const postsValidator = require("../middleware/postsValidator");
const idValidator = require("../middleware/idValidator");
const checkDataIDs = require("../middleware/checkDataIDs");
const validatePostsUpdate = require("../middleware/validatePostsUpdate");
const valid = require("../middleware/valid");
const controller = require("../controllers/posts");


router.get("/", postsValidator, controller.get);

router.get("/:id", idValidator, controller.getById);

router.post("/", [auth, valid(validate), checkDataIDs], controller.post);

router.put('/:id', [auth, idValidator, valid(validatePUT), validatePostsUpdate], controller.put);

router.delete("/:id", [auth, idValidator], controller.delete);

module.exports = router;