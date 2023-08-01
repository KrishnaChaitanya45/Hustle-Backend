const { default: mongoose } = require("mongoose");
const HabitModel = require("../../models/GoalTracker/Habit");
const UserModel = require("../../models/User/User");
const createHabit = async (req, res) => {
  try {
    const {
      title,
      description,
      startTime,
      status,
      duration,
      endTime,
      createdBy,
      weeksSelected,
    } = req.body;
    const id = mongoose.Types.ObjectId(createdBy);
    const newHabit = await HabitModel.create({
      title,
      description,
      startTime,
      duration,
      status,
      endTime,
      weeksSelected,
      createdBy: id,
    });
    const user = await UserModel.findById(id);
    user.habits.push(newHabit);
    await user.save();
    return res.status(201).json({ msg: "Habit Created", habit: newHabit });
  } catch (error) {
    return res.status(500).json({ msg: "Request Failed" });
  }
};
const getHabits = async (req, res) => {
  let id;
  if (req.user) {
    id = mongoose.Types.ObjectId(req.user);
  }
  id = mongoose.Types.ObjectId(req.params.userId);
  const allHabits = await HabitModel.find({ createdBy: id });
  return res.status(200).json({ habits: allHabits });
};
const getAHabit = async (req, res) => {};
const updateHabit = async (req, res) => {
  let userId;
  try {
    if (req.user) {
      userId = mongoose.Types.ObjectId(req.user);
    }
    const { id } = req.params;
    const { status, date, percentage, startTime, endTime } = req.body;
    const habitId = mongoose.Types.ObjectId(id);
    userId = mongoose.Types.ObjectId(req.body.userId);
    const habit = await HabitModel.find({ _id: habitId, createdBy: userId });
    if (!habit) {
      return res.status(404).json({ msg: "Habit Not Found" });
    }

    const existingDay = habit[0].dates.find((day) => {
      return (
        new Date(day.date).toDateString() === new Date(date).toDateString()
      );
    });

    if (existingDay) {
      let today;
      try {
        today = existingDay.dates.find(
          (_) =>
            moment(_.date).format("DD-MM-YYYY") == moment().format("DD-MM-YYYY")
        );
      } catch (error) {
        return res.status(405).json({ msg: "UNABLE TO RESOLVE THE DATE" });
      }
      try {
        today.status = status;
        today.endTime = endTime;
        today.percentage = percentage;
      } catch (error) {
        return res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
      }
    } else {
      habit[0].startTime = startTime;
      if (endTime) {
        habit[0].endTime = endTime;
      }
      habit[0].dates.push({ date, status, percentage: percentage });
    }

    if (status === "completed") {
      habit[0].dates.push({
        date: Date.now(),
        status: "done",
        percentage: percentage,
      });
    }
    await habit[0].save();
    return res.status(200).json({ msg: "Habit Updated", habit });
  } catch (error) {
    return res.status(500).json({ msg: error });
  }
};
const deleteAHabit = async (req, res) => {};
module.exports = {
  createHabit,
  getHabits,
  getAHabit,
  updateHabit,
  deleteAHabit,
};
