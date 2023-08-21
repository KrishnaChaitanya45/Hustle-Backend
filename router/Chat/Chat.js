const express = require("express");
const router = express.Router();
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroupChat,
  removeFromGroupChat,
  addToGroupChat,
} = require("../../controller/Chat/chatController");
const {
  sendMessage,
  fetchMessages,
} = require("../../controller/Chat/messageController");
const singleUpload = require("../../middleware/multer");

router.route("/:user").post(accessChat);
router.route("/:user").get(fetchChats);
router.route("/:user/group").post(singleUpload, createGroupChat);
router.route("/:user/group-rename").put(singleUpload, renameGroupChat);
router.route("/:user/group-add-member").put(addToGroupChat);
router.route("/:user/group-remove").delete(removeFromGroupChat);
router.route("/:user/message/").post(singleUpload, sendMessage);
router.route("/:user/message/:chatId").get(fetchMessages);
module.exports = router;
