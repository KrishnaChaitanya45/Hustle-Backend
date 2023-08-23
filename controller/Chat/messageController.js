const asyncHandler = require("express-async-handler");
const Message = require("../../models/Chat/messageModel");
const chatModel = require("../../models/Chat/chatModel");
const cloudinary = require("cloudinary").v2;
const getDataURI = require("../../utils/DataURI");
require("dotenv").config();
const User = require("../../models/User/User");
const sendMessage = asyncHandler(async (req, res) => {
  const { message, chatId } = req.body;
  console.log(req.body);
  if ((!req.file && !message) || !chatId) {
    return res.status(400).json({
      message: "Please send all the required fields",
    });
  }
  const chat = await chatModel.findById(chatId);
  if (!chat) {
    return res.status(400).json({
      message: "Chat not found",
    });
  }
  let image_url = null;
  if (req.file) {
    const image = getDataURI(req.file);
    image_url = await cloudinary.uploader.upload(image.content, {
      public_id: `DearDiary/${chatId}/media`,
    });
  }
  var newMessage = {
    sender: req.params.user,
    message,
    media: image_url && image_url.secure_url,
    chat: chatId,
  };
  try {
    let message = await Message.create(newMessage);
    message = await message.populate("sender", "username profilePhoto email");
    // console.log(message);
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "username profilePhoto email",
    });
    await chatModel.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });
    res.status(200).send(message);
  } catch (error) {
    console.log(error);
    res.status(500);
    throw new Error("Internal Server Error");
  }
});
const fetchMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({
      chat: req.params.chatId,
    })
      .populate("sender", "username profilePhoto email")
      .populate("chat");
    res.status(200).send(messages);
  } catch (error) {
    console.log(error);
    res.status(500);
    throw new Error("Internal Server Error");
  }
});

module.exports = { sendMessage, fetchMessages };
