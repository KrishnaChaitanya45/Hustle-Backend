const express = require("express");
const {
  getHabits,
  createHabit,
  updateHabit,
} = require("../../controller/GoalTracker/Habit");
const router = express.Router();

router.route("/habits/:userId").post(createHabit).get(getHabits);
router.route("/habits/:id").patch(updateHabit);
module.exports = router;
