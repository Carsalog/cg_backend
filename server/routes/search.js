const express = require("express");
const {Post} = require("../models/posts");
const router = express.Router();

router.get("/", async (req, res) => {
  /**
   * Get amount of car makes by page
   * @return Object:
   */

  console.log(req.query);
  if ('q' in req.query) return res.send([]);
  else {
    return res.send([{_id: "1", name: "cap"}]);
  }
});


module.exports = router;