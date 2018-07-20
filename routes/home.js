const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  const context = {};
  return res.render('index', context)
});

module.exports = router;