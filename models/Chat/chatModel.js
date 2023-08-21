const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    isGroup: {
      type: Boolean,
      default: false,
    },
    chatName: {
      type: String,
      default: "",
    },
    chatDescription: {
      type: String,
      default: "",
    },
    groupIcon: {
      type: String,
      default:
        "https://www.pngitem.com/pimgs/m/30-307416_profile-icon-png-image-free-download-searchpng-employee.png",
    },
    chatBackground: {
      type: String,
      default:
        "https://w0.peakpx.com/wallpaper/958/256/HD-wallpaper-black-bull-black-clover-anime-black-bulls-magic-knights-emblems.jpg",
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
