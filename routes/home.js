const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  const context = {};
  return res.render('index', context)
});

router.get("*", (req, res) => {
  return res.status(404).send({error: "Page note found"})
});

module.exports = router;