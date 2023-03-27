const mongoose = require("mongoose");
const taskSchema = new mongoose.Schema(
  {
    starttime: {
      type: Date,
    },
    title: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    completedAt: {
      type: Date,
      default: Date.now(),
    },
    duration: {
      type: Number,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["completed", "working", "pending", "timeexceeded"],
      default: "pending",
    },
    belongsTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MainTask",
    },
    deadline: {
      type: Date,
    },
  },
  { timestamps: true }
);

const SubTask = mongoose.model("SubTask", taskSchema);
SubTask.createCollection().then(function (collection) {});
module.exports = SubTask;
