const mongoose = require("mongoose");
const moment = require("moment");
const taskSchema = new mongoose.Schema(
  {
    startTime: {
      type: Object,
    },
    endTime: {
      type: Object,
    },
    title: {
      type: String,
    },
    lastDateNotified: {
      type: Object,
    },
    percentageWorked: {
      type: Number,
    },
    points: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    completedAt: {
      type: Date,
    },
    progress: {
      type: Array,
    },
    duration: {
      type: Object,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["completed", "working", "pending", "timeexceeded"],
      default: "pending",
    },
    start: {
      type: Date,
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
