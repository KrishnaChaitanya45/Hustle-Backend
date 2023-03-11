const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectToDatabase = require("./db/connectToDb");
const MainTask = require("./router/GoalTracker/MainTasks");
const Habit = require("./router/GoalTracker/Habits");
const User = require("./router/User/User");
const authenticateJWT = require("./middleware/Auth");
const app = express();
require("dotenv").config();
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use("/api/v1/tasks/", authenticateJWT, MainTask);
app.use("/api/v1/auth/", User);
app.use("/api/v1/user", Habit);

const start = async () => {
  try {
    await connectToDatabase(process.env.MONGO_URI);
    console.log("Connected to Database..!");
    app.listen(5000);
  } catch (error) {
    console.log("working offline..!");
    app.listen(5000);
  }
};
start();
