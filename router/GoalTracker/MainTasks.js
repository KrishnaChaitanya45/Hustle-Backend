const express = require("express");
const router = express.Router();
const {
  getAllMainTasks,
  updateMainTask,
  deleteAMainTask,
  createMainTask,
  getASingleMainTask,
} = require("../../controller/GoalTracker/MainTask");
const {
  getAllSubTask,
  CreateSubTask,
  updateSubTask,
  deleteASubTask,
} = require("../../controller/GoalTracker/SubTask");
router
  .route("/main-tasks/:id/sub-tasks")
  .get(getAllSubTask)
  .post(CreateSubTask);
router
  .route("/main-tasks/:id/sub-tasks/:taskId")
  .patch(updateSubTask)
  .delete(deleteASubTask);

router.route("/main-tasks/").get(getAllMainTasks).post(createMainTask);
router
  .route("/main-tasks/:id")
  .get(getASingleMainTask)
  .patch(updateMainTask)
  .delete(deleteAMainTask);
module.exports = router;
