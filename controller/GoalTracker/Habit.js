const { default: mongoose } = require("mongoose");
const HabitModel = require("../../models/GoalTracker/Habit");
const UserModel = require("../../models/User/User");
const createHabit = async (req, res) => {
  const { title, description, starttime, status, endtime, userId } = req.body;
  const id = mongoose.Types.ObjectId(userId);
  const newHabit = await HabitModel.create({
    title,
    description,
    starttime,
    status,
    endtime,
    createdBy: id,
  });
  const user = await UserModel.findById(id);
  user.habits.push(newHabit);
  await user.save();
  return res.status(201).json({ msg: "Habit Created", habit: newHabit });
};
const getHabits = async (req, res) => {
  const id = mongoose.Types.ObjectId(req.user);
  const allHabits = await HabitModel.find({ createdBy: id });
  return res.status(200).json({ habits: allHabits });
};
const getAHabit = async (req, res) => {};
const updateHabit = async (req, res) => {
  const { id } = req.params;
  const { status, date } = req.body;
  const habitId = mongoose.Types.ObjectId(id);
  const userId = mongoose.Types.ObjectId(req.user);
  const habit = await HabitModel.find({ _id: habitId, createdBy: userId });
  const existingDay = habit[0].dates.find((day) => {
    return new Date(day.date).toDateString() === new Date(date).toDateString();
  });

  if (existingDay) {
    existingDay.status = status;
  } else {
    habit[0].dates.push({ date, status });
  }

  if (status === "completed") {
    habit[0].dates.push({ date: Date.now(), status: "done" });
  }
  await habit[0].save();
  return res.status(200).json({ msg: "Habit Updated", habit });
};
const deleteAHabit = async (req, res) => {};
module.exports = {
  createHabit,
  getHabits,
  getAHabit,
  updateHabit,
  deleteAHabit,
};
