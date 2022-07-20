const express = require("express");
const router = express.Router();
const { User } = require("../schemas/user.js");
const { Sitter } = require("../schemas/sitter.js");
const { Room } = require("../schemas/room.js");
const { Chat } = require("../schemas/chat.js");

router.get("/", async (req, res, next) => {
  




  res.send({msg: "성공"});
});



router.post("/", async (req, res, next) => {
  




  res.send({msg: "성공"});
});

module.exports = router;