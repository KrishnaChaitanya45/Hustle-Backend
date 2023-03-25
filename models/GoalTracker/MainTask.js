const mongoose = require("mongoose");
const taskSchema = new mongoose.Schema(
  {
    createdAt: {
      type: Date,
    },
    title: {
      type: String,
    },
    category: {
      type: String,
    },
    assignedTasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubTask",
      },
    ],

    workingTasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubTask",
      },
    ],
    pendingTasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubTask",
      },
    ],
    completedTasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubTask",
      },
    ],

    failedTasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubTask",
      },
    ],

    completedAt: {
      type: Date,
    },
    totalTasks: {
      type: Number,
      default: 0,
    },
    totalTime: {
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    start: {
      type: Date,
    },
    startTime: {
      type: Number,
    },
    endTime: {
      type: Number,
    },
    deadline: {
      type: Date,
    },
    subtasks: [
      {
        task: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "SubTask",
        },
      },
    ],
  },
  { timestamps: true }
);

const MainTask = mongoose.model("MainTask", taskSchema);
MainTask.createCollection().then(function (collection) {});
module.exports = MainTask;
