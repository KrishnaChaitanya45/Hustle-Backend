const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const UserModal = require("./models/User/User");
const connectToDatabase = require("./db/connectToDb");
const MainTask = require("./router/GoalTracker/MainTasks");
const Habit = require("./router/GoalTracker/Habits");
const Chat = require("./router/Chat/Chat");
const User = require("./router/User/User");
const authenticateJWT = require("./middleware/Auth");
app.use(
  cors({
    credentials: true,
  })
);
process.env.GOOGLE_APPLICATION_CREDENTIALS;
initializeApp({
  credential: applicationDefault(),
  projectId: "hustle-6ff85",
});
const multer = require("multer");
require("dotenv").config();
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
app.use(express.json());
app.use("/api/v1/tasks/:userId", authenticateJWT, MainTask);
app.use("/api/v1/auth/", User);
app.use("/api/v1/user", Habit);
app.use("/api/v1/chat", Chat);
const io = require("socket.io")(server, {
  allowEIO3: true,
  allowRequest: (req, callback) => {
    callback(null, false);
  },
  cors: {
    origin: "*",
  },
});
const messagesSpace = io.of("/messages");
const usersSpace = io.of("/users");

usersSpace.on("connection", async (socket) => {
  const userId = socket.handshake.auth.userId;
  console.log("=== USER CONNECTED ===", userId);
  //INFORM EVERY ONE THAT THE USER IS ONLINE
  socket.broadcast.emit("user-connected", userId);
  await UserModal.findByIdAndUpdate(userId, { $set: { is_online: true } });
  socket.on("setup", async (userData) => {});
  socket.on("disconnect", async () => {
    console.log("USER DISCONNECTED");
    socket.broadcast.emit("user-offline", userId);
    await UserModal.findByIdAndUpdate(userId, { $set: { is_online: false } });
  });
});

messagesSpace.on("connection", (socket) => {
  let userData;
  console.log("connected");
  socket.on("setup", (userData) => {
    userData = userData;
    socket.join(userData._id);
    console.log("USER ADDED", userData.username);
    socket.emit("connected");
  });
  socket.on("join-chat", (room) => {
    socket.join(room);
    console.log("=== JOINED ROOM ===", room);
  });
  socket.on("send-message", (newMessage) => {
    let chat = newMessage.chat;
    // const senderUser = newMessage.sender.username;
    // const receiverTokens = newMessage.chat.users.filter(
    //   (user) => user._id != newMessage.sender._id
    // );
    // const tokens = receiverTokens.map((user) => user.fcm_token);
    // console.log(tokens);
    // const messageToSend = {
    //   notification: {
    //     title: senderUser,
    //     body: newMessage.message,
    //   },
    //   tokens: tokens,
    // };
    // console.log("REACHED HERE ..!");
    // getMessaging()
    //   .send(messageToSend)
    //   .then((response) => {
    //     console.log("MESSAGE SENT SUCCESSFULLY");
    //   })
    //   .catch((err) => console.log("MESSAGE SENDING FAILED"));
    // console.log("REACHED HERE ..! AFTER");
    if (!chat.users) return console.log("Chat.users not defined");
    chat.users.forEach((user) => {
      if (user._id == newMessage.sender._id) return;
      console.log("REACHED HERE ===");
      socket.in(user._id).emit("message-received", newMessage);
    });
  });
  socket.on("typing", (room, chat, sender) => {
    let userData;

    chat.users.forEach((user) => {
      if (user == sender._id) {
        return;
      }

      socket.in(room).emit("typing", sender);
    });
  });
  socket.on("stop-typing", (room, chat, sender) => {
    chat.users.forEach((user) => {
      if (user._id == sender._id) return;
      console.log("REACHED HERE ===");
      socket.in(room).emit("stop-typing", chat.sender);
    });
  });
  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
const start = async () => {
  try {
    await connectToDatabase(process.env.MONGO_URI);
    console.log("Connected to Database..!");
    server.listen(5000);
  } catch (error) {
    console.log("working offline..!");
    server.listen(5000);
  }
};
start();
