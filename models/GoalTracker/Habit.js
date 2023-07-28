const mongoose = require("mongoose");
const habitSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
  },
  habitIcon: {
    type: String,
    default:
      "https://res.cloudinary.com/deardiary/image/upload/v1690529766/DearDiary/Habits/habits-default_n8ed6d.avif",
  },
  title: {
    type: String,
  },
  starttime: {
    type: Object,
  },
  totalTime: {
    type: Object,
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
        enum: ["done", "failed", "pending"],
        default: "pending",
        //TODO set time to 24 hours or 84600000 milliseconds
      },
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  endtime: {
    type: Object,
  },
});

const Habit = mongoose.model("Habit", habitSchema);
Habit.createCollection().then(function (collection) {});
module.exports = Habit;
