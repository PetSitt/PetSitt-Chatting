const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  userId_A: {
    type: String,
    required: true,    
  },
  userId_B: {
    type: String,
    required: true,    
  },
  lastChat: {
    type: String,
    default: "",
  },
  lastChatAt: {
    type: Date,
    default: Date.now,
  },
});

roomSchema.virtual("roomId").get(function () {
 return this._id.toHexString();
});

roomSchema.set("toJSON", {
 virtuals: true,
});

module.exports = { Room: mongoose.model("Room", roomSchema) };
