const SubTaskModel = require("../../models/GoalTracker/SubTask");
const MainTaskModel = require("../../models/GoalTracker/MainTask");
const { default: mongoose } = require("mongoose");
const getAllSubTask = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const allSubTasks = await SubTaskModel.find({ belongsTo: id });
  console.log(allSubTasks);
  return res.status(200).json({ subtasks: allSubTasks });
};
const CreateSubTask = async (req, res) => {
  const { title, description, starttime, status, deadline } = req.body;
  const newSubTask = await SubTaskModel.create({
    title,
    description,
    starttime,
    status,
    belongsTo: req.params.id,
    deadline,
  });

  const subtaskId = mongoose.Types.ObjectId(req.params.id);
  const MainTask = await MainTaskModel.findById(subtaskId);
  MainTask.pendingTasks.push(newSubTask);
  MainTask.assignedTasks.push(newSubTask);
  MainTask.subtasks.push(newSubTask);
  await MainTask.save();

  return res.status(201).json({ msg: "Task Created", task: newSubTask });
};
const updateSubTask = async (req, res) => {
  const { taskId, id } = req.params;
  const { title, description, status, deadline, starttime } = req.body;
  const subtaskId = mongoose.Types.ObjectId(taskId);

  try {
    const Subtask = await SubTaskModel.findById(subtaskId);

    Subtask.title = title;
    Subtask.description = description;
    Subtask.starttime = starttime;
    Subtask.status = status.toLowerCase();
    console.log("Works Here");
    Subtask.deadline = deadline;
    if (status.toLowerCase() === "completed") {
      Subtask.completedAt = Date.now().toLocaleString();
    }
    const MainTask = await MainTaskModel.findById(id);
    if (status.toLowerCase() === "completed") {
      MainTask.completedTasks.push(MainTask);
      MainTask.pendingTasks = MainTask.pendingTasks.filter(
        (e) => e.toString() != subtaskId.toString()
      );
      MainTask.workingTasks = MainTask.workingTasks.filter(
        (e) => e.toString() != subtaskId.toString()
      );
    } else if (status.toLowerCase() === "working") {
      MainTask.workingTasks.push(MainTask);
      MainTask.pendingTasks = MainTask.pendingTasks.filter(
        (e) => e.toString() != subtaskId.toString()
      );
    } else if (status.toLowerCase() === "pending") {
      MainTask.pendingTasks.push(MainTask);
      MainTask.workingTasks = MainTask.workingTasks.filter(
        (e) => e.toString() != subtaskId.toString()
      );
    }

    await MainTask.save();
    await Subtask.save();

    return res.status(200).json({ msg: "Task Updated", task: Subtask });
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};
const deleteASubTask = async () => {};

module.exports = {
  getAllSubTask,
  CreateSubTask,
  updateSubTask,
  deleteASubTask,
};
