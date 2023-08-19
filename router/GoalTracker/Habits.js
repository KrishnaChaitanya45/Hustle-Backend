const express = require("express");
const {
  getHabits,
  createHabit,
  updateHabit,
  getAllFriends,
  addFriend,
  getFriend,
  removeFriend,
} = require("../../controller/GoalTracker/Habit");
const singleUpload = require("../../middleware/multer");
const router = express.Router();
router.route("/friends/:userId").post(addFriend).get(getAllFriends);
router.route("/friends/:userId/:friendId").delete(removeFriend).get(getFriend);
router.route("/habits/:userId").post(singleUpload, createHabit).get(getHabits);
router.route("/habits/:id").patch(updateHabit);
module.exports = router;
