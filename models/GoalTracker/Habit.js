const mongoose = require("mongoose");
const habitSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
  },
  habitIcon: {
    type: String,
    default:
      "https://res.cloudinary.com/deardiary/image/upload/c_pad,b_auto:predominant,fl_preserve_transparency/v1690560297/DearDiary/Habits/bike-riding_htmflg.jpg?_s=public-apps",
  },
  title: {
    type: String,
  },
  startTime: {
    type: Object,
  },
  duration: {
    type: Object,
  },
  description: {
    type: String,
  },
  weeksSelected: {
    type: Array,
  },
  lastNotifiedDate: {
    type: Object,
  },
  dates: [
    {
      date: {
        type: Date,
      },
      startTime: {
        type: Object,
      },
      endTime: {
        type: Object,
      },
      status: {
        type: String,
        enum: ["done", "failed", "pending"],
        default: "pending",
        //TODO set time to 24 hours or 84600000 milliseconds
      },
      percentage: {
        type: Number,
        default: 0,
      },
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  endTime: {
    type: Object,
  },
});

const Habit = mongoose.model("Habit", habitSchema);
Habit.createCollection().then(function (collection) {});
module.exports = Habit;
