const asyncHandler = require("express-async-handler");
const Message = require("../../models/Chat/messageModel");
const chatModel = require("../../models/Chat/chatModel");
const cloudinary = require("cloudinary").v2;
const getDataURI = require("../../utils/DataURI");
require("dotenv").config();
const { getMessaging } = require("firebase-admin/messaging");
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
      select: "username profilePhoto email fcm_token",
    });
    // console.log("=== Message === ", message.chat);
    await chatModel.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });
    const senderUser = message.sender.username;
    const receiverTokens = message.chat.users.filter(
      (user) => user._id != req.params.user
    );
    const tokens = receiverTokens.map((user) => user.fcm_token);
    console.log(tokens);
    const messageToSend = {
      notification: {
        title: senderUser + " has sent you a message",
        body: message.message,
      },
      tokens: tokens,
    };
    try {
      const response = await getMessaging().sendEachForMulticast(messageToSend);
      console.log(response);
      return res.status(201).send(message);
    } catch (error) {
      return res
        .status(500)
        .json({ msg: "NOTIFICATION SENDING FAILED ", error });
    }
  } catch (error) {
    console.log(error);
    res.status(500);
    throw new Error("Internal Server Error");
  }
});
const fetchMessages = asyncHandler(async (req, res) => {
  try {
    let messages = await Message.find({
      chat: req.params.chatId,
    })
      .populate("sender", "username profilePhoto email")
      .populate("chat");

    console.log(messages[0]);
    res.status(200).send(messages);
  } catch (error) {
    console.log(error);
    res.status(500);
    throw new Error("Internal Server Error");
  }
});

module.exports = { sendMessage, fetchMessages };
