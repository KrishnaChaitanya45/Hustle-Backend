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
  const {
    title,
    description,
    startTime,
    status,
    deadline,
    endTime,
    start,
    duration,
  } = req.body;
  const newSubTask = await SubTaskModel.create({
    title,
    description,
    startTime,
    status,
    endTime,
    start,
    duration,
    belongsTo: req.params.id,
    deadline,
  });

  const subtaskId = mongoose.Types.ObjectId(req.params.id);
  const MainTask = await MainTaskModel.findById(subtaskId);
  MainTask.status = "working";
  console.log(MainTask.status);
  if (newSubTask.status.toLowerCase() === "completed") {
    newSubTask.completedAt = Date.now();
    MainTask.completedTasks.push(newSubTask);
  } else if (newSubTask.status.toLowerCase() === "working") {
    MainTask.workingTasks.push(newSubTask);
  } else if (newSubTask.status.toLowerCase() === "pending") {
    MainTask.pendingTasks.push(newSubTask);
  }
  MainTask.assignedTasks.push(newSubTask);
  MainTask.subtasks.push(newSubTask);
  await MainTask.save();

  return res.status(201).json({ msg: "Task Created", task: newSubTask });
};
const updateSubTask = async (req, res) => {
  const { taskId, id } = req.params;
  const {
    title,
    description,
    startTime,
    status,
    progress,
    deadline,
    endTime,
    start,
    duration,
  } = req.body;
  const subtaskId = mongoose.Types.ObjectId(taskId);

  try {
    const Subtask = await SubTaskModel.findById(subtaskId);
    console.log(Subtask);
    Subtask.title = title;
    Subtask.description = description;
    Subtask.startTime = startTime;
    Subtask.start = start;
    Subtask.progress = progress;
    Subtask.endTime = endTime;
    Subtask.duration = duration;
    Subtask.status = status.toLowerCase();
    console.log("Works Here");
    Subtask.deadline = deadline;
    const MainTask = await MainTaskModel.findById(id);

    if (Subtask.status.toLowerCase() === "completed") {
      console.log("reached here");
      Subtask.completedAt = Date.now();
      MainTask.completedTasks.push(MainTask);
      console.log(MainTask.completedTasks);
      console.log("reached here-1");
      console.log("reached here-2");
      MainTask.pendingTasks = MainTask.pendingTasks.filter(
        (e) => e.toString() != subtaskId.toString()
      );
      console.log("reached here-3");
      MainTask.workingTasks = MainTask.workingTasks.filter(
        (e) => e.toString() != subtaskId.toString()
      );
    } else if (Subtask.status.toLowerCase() === "working") {
      MainTask.workingTasks.push(MainTask);
      MainTask.pendingTasks = MainTask.pendingTasks.filter(
        (e) => e.toString() != subtaskId.toString()
      );
    } else if (Subtask.status.toLowerCase() === "pending") {
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
