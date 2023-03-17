const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const connectToDatabase = require("./db/connectToDb");
const MainTask = require("./router/GoalTracker/MainTasks");
const Habit = require("./router/GoalTracker/Habits");
const User = require("./router/User/User");
const authenticateJWT = require("./middleware/Auth");
const app = express();
const multer = require("multer");
require("dotenv").config();
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/tmp"); // we should create the  folder for uploads
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
app.use(multer({ storage: storage }).single("image"));
app.use(express.json());
app.use("/uploads", express.static(__dirname + "/tmp"));
app.use("/uploads", express.static("tmp"));
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
