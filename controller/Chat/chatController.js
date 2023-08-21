const asyncHandler = require("express-async-handler");
const Chat = require("../../models/Chat/chatModel");
const userModel = require("../../models/User/User");
const getDataURI = require("../../utils/DataURI");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res
      .status(400)
      .json({ message: "User Id  is not sent with the request" });
  }
  var isChat = await Chat.find({
    isGroup: false,
    $and: [
      { users: { $elemMatch: { $eq: req.params.user } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");
  //   console.log("=== IS CHAT ===", isChat);

  isChat = await userModel.populate(isChat, {
    path: "latestMessage.sender",
    select: "username email",
  });
  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "Personal Chat",
      isGroup: false,
      users: [req.params.user, userId],
    };
    try {
      const createChat = await Chat.create(chatData);
      const fullChat = await Chat.findById(createChat._id).populate(
        "users",
        "-password"
      );
      res.status(200).send(fullChat);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error from the server while accessing chats" });
    }
  }
});

const fetchChats = asyncHandler(async (req, res) => {
  try {
    if (!req.params.user)
      return res
        .status(400)
        .json({ message: "User Id is not sent with the request" });
    //Get All the chats in which the req.user has been the part of
    if (req.query.onlyGroup) {
      Chat.find({
        users: { $elemMatch: { $eq: req.params.user } },
        isGroup: true,
      })
        .populate("users", "-password")
        .populate("latestMessage")
        .populate("groupAdmin", "-password")
        .sort({ updatedAt: -1 })
        .then(async (result) => {
          result = await Chat.populate(result, {
            path: "latestMessage.sender",
            select: "username email profilePhoto",
          });
          return res.status(200).send(result);
        });
    } else {
      Chat.find({ users: { $elemMatch: { $eq: req.params.user } } })
        .populate("users", "-password")
        .populate("latestMessage")
        .populate("groupAdmin", "-password")
        .sort({ updatedAt: -1 })
        .then(async (result) => {
          result = await Chat.populate(result, {
            path: "latestMessage.sender",
            select: "username email profilePhoto",
          });
          return res.status(200).send(result);
        });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error from the server while fetching chats" });
  }
});
const createGroupChat = asyncHandler(async (req, res) => {
  let { userIds, chatName, chatDescription, creatorId } = req.body;
  //   console.log(userIds, chatName);
  if (userIds && typeof userIds === "string") userIds = JSON.parse(userIds);
  if (!userIds || !chatName) {
    return res.status(400).json({
      message: "Please send all the required fields",
    });
  }
  if (userIds.length < 2) {
    return res.status(400).json({
      message: "Please add atleast 2 members",
    });
  }
  userIds.push(req.params.user);
  let image_url = null;
  try {
    if (req.file) {
      const image = getDataURI(req.file);
      image_url = await cloudinary.uploader.upload(image.content, {
        public_id: `DearDiary/${chatName}`,
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error while working with the image upload" });
  }
  var chatData = {
    chatName: chatName,
    chatDescription: chatDescription,
    isGroup: true,
    groupIcon: image_url && image_url.secure_url,

    users: userIds,
    groupAdmin: creatorId,
  };
  try {
    const createChat = await Chat.create(chatData);
    const fullChat = await Chat.findById(createChat._id)
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.status(200).send(fullChat);
  } catch (error) {
    console.log(error);
    res.status(500);
    throw new Error("Internal Server Error");
  }
});

const renameGroupChat = asyncHandler(async (req, res) => {
  const { chatId, chatName, chatDescription } = req.body;
  if (!chatId) {
    return res.status(400).json({
      message: "Please send chat Id",
    });
  }
  let image_url = null;
  try {
    if (req.file) {
      const image = getDataURI(req.file);
      image_url = await cloudinary.uploader.upload(image.content, {
        public_id: `DearDiary/${chatName}`,
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error while working with the image upload" });
  }
  try {
    const chat = await Chat.findById(chatId)
      .populate("groupAdmin", "-password")
      .populate("users", "-password");
    if (!chat) {
      return res.status(400).json({
        message: "Chat not found",
      });
    }
    // ADD THIS IF NECESSARY
    // if (chat.groupAdmin.toString() !== req.user._id.toString()) {
    //   return res.status(400).json({
    //     message: "You are not the admin of this group",
    //   });
    // }
    chat.chatName = chatName;
    chat.chatDescription = chatDescription;
    if (image_url) {
      chat.groupIcon = image_url.secure_url;
    }
    await chat.save();
    res.status(200).send(chat);
  } catch (error) {
    console.log(error);
    res.status(500);
    throw new Error("Internal Server Error");
  }
});
const removeFromGroupChat = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  if (!req.params.user) {
    return res.status(400).json({
      message: "Please send user id with the request",
    });
  }
  if (!chatId || !userId) {
    return res.status(400).json({
      message: "Please send all the required fields",
    });
  }
  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(400).json({
        message: "Chat not found",
      });
    }

    if (chat.groupAdmin.toString() !== req.params.user.toString()) {
      return res.status(400).json({
        message: "You are not the admin of this group",
      });
    }
    if (chat.groupAdmin.toString() === userId.toString()) {
      return res.status(400).json({
        message: "You cannot remove yourself from the group",
      });
    }
    chat.users = chat.users.filter(
      (user) => user._id.toString() !== userId.toString()
    );
    await chat.save();
    res.status(200).send(chat);
  } catch (error) {
    console.log(error);
    res.status(500);
    throw new Error("Internal Server Error");
  }
});
const addToGroupChat = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  if (!chatId || !userId) {
    return res.status(400).json({
      message: "Please send all the required fields",
    });
  }
  try {
    let chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(400).json({
        message: "Chat not found",
      });
    }
    if (chat.users.includes(userId)) {
      return res.status(400).json({
        message: "User already in the group",
      });
    }
    chat.users.push(userId);
    await chat.save();
    chat = await Chat.findById(chatId)
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.status(200).send(chat);
  } catch (error) {
    console.log(error);
    res.status(500);
    throw new Error("Internal Server Error");
  }
});
module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroupChat,
  addToGroupChat,
  removeFromGroupChat,
};
