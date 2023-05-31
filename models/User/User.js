const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const UserSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now().toString(),
  },
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  points: {
    type: Number,
  },
  password: {
    type: String,
  },
  bio: {
    type: String,
  },
  interests: {
    type: Array,
  },
  assignedTasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MainTask",
    },
  ],

  workingTasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MainTask",
    },
  ],
  pendingTasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MainTask",
    },
  ],
  completedTasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MainTask",
    },
  ],

  failedTasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MainTask",
    },
  ],
  target: {
    targetTasks: {
      type: Number,
      default: 10,
    },
    upto: {
      type: Date,
      default: new Date().setDate(new Date().getDate() + 1),
      expires: 1000 * 60 * 60 * 24,
    },
  },
  username: {
    type: String,
    unique: true,
  },
  tasks: [
    {
      task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MainTask",
      },
    },
  ],
  profilePhoto: {
    type: String,
  },
  habits: [
    {
      habit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Habit",
      },
    },
  ],
  tokens: [
    {
      token: {
        type: String,
      },
    },
  ],
  //   createdBy: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "User",
  //   },
});
UserSchema.methods.generateAuthToken = async function () {
  try {
    const token = jwt.sign({ id: this._id }, process.env.SECRET);
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (error) {
    console.log(error);
    return error;
  }
};
const User = mongoose.model("User", UserSchema);
User.createCollection().then(function (collection) {});
module.exports = User;
