const mongoose = require("mongoose");
const habitSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
  },
  title: {
    type: String,
  },
  starttime: {
    type: Date,
  },
  totalTime: {
    type: Number,
  },
  description: {
    type: String,
  },
  dates: [
    {
      date: {
        type: Date,
      },
      status: {
        type: String,
        enum: ["done", "failed"],
        default: "failed",
        //TODO set time to 24 hours or 84600000 milliseconds
      },
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  endtime: {
    type: Date,
  },
});

const Habit = mongoose.model("Habit", habitSchema);
Habit.createCollection().then(function (collection) {});
module.exports = Habit;
