const mongoose = require("mongoose");
const Joi = require("joi");
const config = require("config");

const messageSchema = new mongoose.Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: config.get("users.tableName")
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: config.get("users.tableName")
  },
  text: {
    type: String,
    minlength: config.get("messages.text.min"),
    maxlength: config.get("messages.text.max"),
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  seen: {
    type: Boolean,
    default: false
  }
});

const Message = mongoose.model(String(config.get("messages.tableName")), messageSchema);


async function getBySenderReceiver(senderId, receiverId) {
  return Message.find({sender: senderId, receiver: receiverId})
}

async function create(msg) {
  const message = Message(msg);
  return message.save();
}

async function update(_id, text) {

  const current = await Message.findById(_id);
  if (!current) return null;

  // Update and return a car type
  current.text = text;
  return current.save();
}

async function remove(pbjectId) {
  return Message.findByIdAndRemove(objectId);
}