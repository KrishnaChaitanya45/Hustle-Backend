const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const connectToDatabase = require("./db/connectToDb");
const MainTask = require("./router/GoalTracker/MainTasks");
const Habit = require("./router/GoalTracker/Habits");
const User = require("./router/User/User");
const authenticateJWT = require("./middleware/Auth");
app.use(cors());

const multer = require("multer");
require("dotenv").config();
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
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
