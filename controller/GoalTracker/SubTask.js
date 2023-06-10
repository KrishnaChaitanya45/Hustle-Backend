const SubTaskModel = require("../../models/GoalTracker/SubTask");
const MainTaskModel = require("../../models/GoalTracker/MainTask");
const UserModel = require("../../models/User/User");
const moment = require("moment");
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
    percentageWorked,
    deadline,
    endTime,
    progress,
    start,
    duration,
  } = req.body;
  const newSubTask = await SubTaskModel.create({
    title,
    description,
    startTime,
    status,
    progress,
    endTime,
    start,
    percentageWorked,
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
  MainTask.totalTasks = MainTask.totalTasks + 1;
  MainTask.subtasks.push(newSubTask);
  await MainTask.save();

  return res.status(201).json({ msg: "Task Created", task: newSubTask });
};
const updateSubTask = async (req, res) => {
  const { taskId, id } = req.params;
  const {
    progress,
    percentageWorked,
    status,
    points,
    startTime,
    startDate,
    endTime,
    endDate,
    duration,
  } = req.body;
  const subtaskId = mongoose.Types.ObjectId(taskId);
  console.log(progress);
  try {
    let Subtask;
    try {
      Subtask = await SubTaskModel.findById(subtaskId);
    } catch (error) {
      console.log("== SUBTASK NOT FOUND ===");
    }

    console.log("reached here..!");
    Subtask.progress = progress;

    Subtask.percentageWorked = percentageWorked;

    Subtask.status = status.toLowerCase();
    console.log("Works Here");
    let MainTask;
    let user;
    try {
      MainTask = await MainTaskModel.findById(id);
    } catch (error) {
      return res.status(404).json({ msg: "MAIN TASK NOT FOUND" });
    }
    try {
      console.log(MainTask.createdBy);
      user = await UserModel.findById(MainTask.createdBy);
    } catch (error) {
      return res.status(404).json({ msg: "USER NOT FOUND" });
    }

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
      console.log("reached here-4");
      console.log("=== PROGRESS ===", progress);
      console.log("=== START TIME ===", startTime);
      console.log("=== END TIME ===", endTime);
      let pointsThirdCheck = 0;
      if (progress.length > 0) {
        const firstCheck =
          moment(startTime, "hh:mm A").isBefore(
            moment(progress[0].startTime)
          ) && moment(endTime, "hh:mm A").isAfter(moment(progress[0].endTime));

        const secondCheck =
          (moment(progress[0].startTime).isBefore(
            moment(startTime, "hh:mm A").add(10, "minutes")
          ) ||
            moment(progress[0].startTime).isBefore(
              moment(startTime, "hh:mm A").subtract(10, "minutes")
            )) &&
          moment(progress[0].endTime).isBefore(
            moment(endTime, "hh:mm A").add(
              (duration.hours * 60 + duration.minutes) / 2,
              "minutes"
            )
          );
        let thirdCheck = false;
        if (!firstCheck && !secondCheck) {
          thirdCheck = true;
          const minutesDiff =
            moment(moment(progress[0].startTime).toISOString()).diff(
              moment(startTime, "hh:mm A").toISOString(),
              "minutes"
            ) +
            moment(moment(progress[0].endTime).toISOString()).diff(
              moment(endTime, "hh:mm A").toISOString(),
              "minutes"
            );

          console.log("=== MINUTES DIFF ===", minutesDiff);
          const percentage =
            (minutesDiff / (duration.hours * 60 + duration.minutes)) * 100;
          console.log("=== PERCENTAGE ===", percentage);
          function returnPointsBasedOnPercentage(percentage) {
            if (percentage >= 0 && percentage <= 25) {
              return 15;
            } else if (percentage > 25 && percentage <= 50) {
              return 12;
            } else if (percentage > 50 && percentage <= 75) {
              return 9;
            } else if (percentage > 75) {
              return 5;
            }
          }
          pointsThirdCheck = returnPointsBasedOnPercentage(percentage);
        }

        /*
        progess[0].startTime should be  +- 5 minutes of task Start Time AND task.completedAt should be +- 5 minutes of task.endTime, then 20 points
        */

        if (firstCheck) {
          console.log("reached here first check -5");
          Subtask.points = points + 20;
          console.log("reached here first check -6");
          MainTask.points = MainTask.points + 20;
          console.log("reached here first check -7");
          user.points = user.points + 20;
          console.log(user.points, MainTask.points, Subtask.points);
        } else if (secondCheck) {
          console.log("reached here second check -5");
          Subtask.points = points + 18;
          console.log("reached here second check -6");
          MainTask.points = MainTask.points + 18;
          console.log("reached here second check -7");
          user.points = user.points + 18;
        } else if (thirdCheck) {
          console.log("reached here second check -5");
          Subtask.points = points + pointsThirdCheck;
          console.log("reached here second check -6");
          MainTask.points = MainTask.points + pointsThirdCheck;
          console.log("reached here second check -7");
          user.points = user.points + pointsThirdCheck;
        }
      } else {
        console.log("direct complete task");
        Subtask.points = points + 10;
        MainTask.points = MainTask.points + 10;
        user.points = user.points + 10;
      }
      console.log("if completed");
      console.log("MAIN TASK POINTS : ", MainTask.points);
      console.log("SUB TASK POINTS : ", Subtask.points);
      console.log("USER POINTS : ", user.points);
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
    console.log("reached here-5");
    if (MainTask.assignedTasks.length === MainTask.completedTasks.length) {
      MainTask.status = "completed";
    } else {
      MainTask.status = "working";
    }
    console.log("reached here-6");
    await MainTask.save();
    console.log("reached here-7");
    await Subtask.save();
    await user.save();
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
