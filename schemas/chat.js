const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  chatText: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: new Date(),
    required: true,
  },
});

chatSchema.virtual("chatId").get(function () {
 return this._id.toHexString();
});

chatSchema.set("toJSON", {
 virtuals: true,
});

module.exports = { Chat: mongoose.model("Chat", chatSchema) };
