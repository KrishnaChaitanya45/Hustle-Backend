const { default: mongoose } = require("mongoose");
const moment = require("moment");
const MainTaskModel = require("../../models/GoalTracker/MainTask");
const userModel = require("../../models/User/User");
const getAllMainTasks = async (req, res) => {
  //DONE TODO: add a user middleware to add the user to the req object
  const query = req.query;
  if (query.status) {
    const allMainTasks = await MainTaskModel.find({
      createdBy: req.user,
      status: query.status,
    });
    return res.status(200).json({ tasks: allMainTasks });
  }
  if (query.category) {
    const allMainTasks = await MainTaskModel.find({
      createdBy: req.user,
      category: query.category,
    });
    return res.status(200).json({ tasks: allMainTasks });
  }
  if (query.todaysTasks) {
    const allTasks = await MainTaskModel.find({
      createdBy: req.user,
    });
    const todaysTasks = allTasks.filter((e) => {
      let dates = [];
      const startDate = moment(e.start);
      const endDate = moment(e.deadline);
      const today = moment().format("YYYY-MM-DD");
      while (startDate.add(1, "days").diff(endDate) < 0) {
        dates.push(moment(startDate).format("YYYY-MM-DD"));
      }

      console.log(dates.indexOf(today));
      if (dates.includes(today)) {
        console.log(e);
        return e;
      }
    });
    return res.status(200).json({ tasks: todaysTasks });
  }
  const allMainTasks = await MainTaskModel.find({ createdBy: req.user });
  return res.status(200).json({ tasks: allMainTasks });
};
const createMainTask = async (req, res) => {
  const userID = mongoose.Types.ObjectId(req.user);
  const {
    title,
    description,
    status,
    category,
    deadline,
    createdAt,
    start,
    startTime,
    endTime,

    totalTime,
  } = req.body;
  const newMainTask = await MainTaskModel.create({
    title,
    description,
    status,
    createdBy: userID,
    createdAt,
    totalTime,
    category,
    start,
    startTime,
    endTime,
    deadline,
  });
  //TODO setup middleware to add user to the req object
  const user = await userModel.findById(userID);
  user.tasks.push(newMainTask);
  user.assignedTasks.push(newMainTask);
  user.pendingTasks.push(newMainTask);
  await user.save();

  return res.status(201).json({ msg: "Task Created", task: newMainTask });
};
const updateMainTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status, category, deadline, createdAt } =
    req.body;
  const MainTaskId = mongoose.Types.ObjectId(id);

  try {
    const MainTask = await MainTaskModel.findById(MainTaskId);
    MainTask.title = title;
    MainTask.description = description;
    MainTask.status = status.toLowerCase();
    MainTask.category = category;
    MainTask.deadline = deadline;
    MainTask.createdAt = createdAt;
    if (status.toLowerCase() === "completed") {
      MainTask.completedAt = Date.now().toLocaleString();
    }
    const user = await userModel.find({ _id: MainTask.createdBy });
    if (status.toLowerCase() === "completed") {
      user[0].completedTasks.push(MainTask);
      user[0].pendingTasks = user[0].pendingTasks.filter(
        (e) => e.toString() != MainTaskId.toString()
      );
      user[0].workingTasks = user[0].workingTasks.filter(
        (e) => e.toString() != MainTaskId.toString()
      );
    } else if (status.toLowerCase() === "working") {
      user[0].workingTasks.push(MainTask);
      user[0].pendingTasks = user[0].pendingTasks.filter(
        (e) => e.toString() != MainTaskId.toString()
      );
    } else if (status.toLowerCase() === "pending") {
      user[0].pendingTasks.push(MainTask);
      user[0].workingTasks = user[0].workingTasks.filter(
        (e) => e.toString() != MainTaskId.toString()
      );
    }

    await user[0].save();
    await MainTask.save();

    return res.status(200).json({ msg: "Task Updated", task: MainTask });
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};
const deleteAMainTask = async (req, res) => {
  const { id } = req.params;
  const MainTaskID = mongoose.Types.ObjectId(id);
  try {
    const MainTask = await MainTaskModel.findByIdAndDelete(MainTaskID);
    const user = await userModel.find({ _id: MainTask.createdBy });
    user[0].completedTasks = user[0].completedTasks.filter(
      (e) => e.toString() != MainTaskID.toString()
    );
    user[0].pendingTasks = user[0].pendingTasks.filter(
      (e) => e.toString() != MainTaskID.toString()
    );
    user[0].workingTasks = user[0].workingTasks.filter(
      (e) => e.toString() != MainTaskID.toString()
    );
    user[0].assignedTasks = user[0].assignedTasks.filter(
      (e) => e.toString() != MainTaskID.toString()
    );

    await user[0].save();
    return res.status(200).json({ msg: "Task Deleted" });
  } catch (err) {
    return res.status(500).json({ msg: "Internal server error" });
  }
};
const getASingleMainTask = async (req, res) => {
  const { id } = req.params;
  const MainTaskId = mongoose.Types.ObjectId(id);
  try {
    const MainTask = await MainTaskModel.findById(MainTaskId);
    return res.status(200).json({ task: MainTask });
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};
const getAllSubTasks = async () => {};
module.exports = {
  getAllMainTasks,
  createMainTask,
  updateMainTask,
  deleteAMainTask,
  getASingleMainTask,
};
