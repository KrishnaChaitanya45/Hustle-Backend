const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const cookieParser = require("cookie-parser");
const cors = require("cors");
const cron = require("node-cron");
const path = require("path");
const moment = require("moment");
const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const UserModal = require("./models/User/User");
const habitsModal = require("./models/GoalTracker/Habit");
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
let notificationSent = [];
console.log(notificationSent);
const SubTask = require("./models/GoalTracker/SubTask");
cron.schedule("* * * * *", async () => {
  const currentTime = moment().toISOString();
  const currentDay = moment().format("dddd");
  console.log("REACHED HERE ..!");
  const habits = await habitsModal.find({}).populate("createdBy", "-password");
  let tasks;
  tasks = await SubTask.find({}).populate({
    path: "belongsTo",
    populate: {
      path: "createdBy",
      model: "User",
      select: "username email profilePhoto fcm_token",
    },
  });
  tasks.forEach(async (task) => {
    const todaysDate = moment();
    const taskStartDate = moment(task.start);
    const taskEndDate = moment(task.deadline).add(1, "day");
    if (moment(todaysDate).isBetween(taskStartDate, taskEndDate)) {
      const startTime = moment(task.startTime.displayTime, "hh:mm:A");
      const difference = moment(startTime).diff(currentTime, "minutes");
      console.log("REACHED HERE - 3 tASK", difference);
      let messages = [];
      if (
        moment(task.lastDateNotified.beforeHalfHour).isBefore(
          moment().toISOString()
        )
      ) {
        if (difference <= 35 && difference >= 20) {
          console.log("REACHED HERE ", task.weeksSelected);

          messages.push({
            title:
              "Hey " +
              task.belongsTo.createdBy.username +
              `! Its time to work on ${task.belongsTo.title}`,
            body: "You have to start " + task.title + " within half an hour..!",
            sender: task.belongsTo.createdBy,
          });
        }
      }
      if (
        moment(task.lastDateNotified.duringHabit).isBefore(
          moment().toISOString()
        )
      ) {
        if (difference <= 35 && difference >= 25) {
          console.log("REACHED HERE ", task.weeksSelected);

          messages.push({
            title:
              "Hey " +
              task.belongsTo.createdBy.username +
              `! Its time to work on ${task.belongsTo.title}`,
            body: "You have to start " + task.title + " within half an hour..!",
            sender: task.belongsTo.createdBy,
          });
        }
      }
      console.log(messages);
      if (messages) {
        messages.map(async (message) => {
          const messageToSend = {
            android: {
              notification: {
                title: message.title,
                body: message.body,
              },
            },

            token: message.sender.fcm_token,
          };
          try {
            const response = await getMessaging().send(messageToSend);
            console.log(response);
            notificationSent.push(task._id);
            if (difference <= 35 && difference >= 20) {
              const modified = JSON.parse(
                JSON.stringify(task.lastDateNotified)
              );
              modified.beforeHalfHour = moment(modified.beforeHalfHour)
                .add(1, "day")
                .toISOString();

              task.lastDateNotified = modified;
              await task.save();
            }

            if (difference <= 10 && difference >= 0) {
              const modified = JSON.parse(
                JSON.stringify(task.lastDateNotified)
              );
              modified.duringHabit = moment(modified.duringHabit)
                .add(1, "day")
                .toISOString();
              console.log("MODIFIED", moment(modified.duringHabit).date());

              task.lastDateNotified = modified;
              await task.save();
            }

            console.log("NOTIFICATION SENT SUCCESSFULLY");
          } catch (error) {
            console.log("NOTIFICATION SENDING FAILED", error);
          }
        });
      }
    }
  });

  let habitsToNotify = [];
  let messages = [];
  habits.forEach(async (habit) => {
    console.log(moment(habit.lastNotifiedDate.beforeOneHour).date());
    console.log(moment(habit.lastNotifiedDate.beforeHalfHour).date());
    console.log(moment(habit.lastNotifiedDate.duringHabit).date());

    console.log("REACHED HERE - 2");
    const startTime = moment(habit.startTime.displayTime, "hh:mm:A");
    const difference = moment(startTime).diff(currentTime, "minutes");
    console.log("REACHED HERE - 3", difference);

    console.log(
      "IS BEFORE",
      moment(habit.lastNotifiedDate.beforeHalfHour).isBefore(
        moment().toISOString()
      )
    );
    if (
      moment(habit.lastNotifiedDate.beforeHalfHour).isBefore(
        moment().toISOString()
      )
    ) {
      if (difference <= 35 && difference >= 25) {
        console.log("REACHED HERE ", habit.weeksSelected);
        if (habit.weeksSelected[0].split(",").find((w) => w == currentDay)) {
          messages.push({
            title: "Hey " + habit.createdBy.username + "!! You ready??🚀 ",
            body:
              "You have to start " + habit.title + " within half an hour..! ⏲️",
            sender: habit.createdBy,
          });

          habitsToNotify.push(habit);
        }
      }
    }
    if (
      moment(habit.lastNotifiedDate.beforeOneHour).isBefore(
        moment().toISOString()
      )
    ) {
      if (difference <= 65 && difference >= 55) {
        console.log("REACHED HERE", habit.weeksSelected);
        if (habit.weeksSelected[0].split(",").find((w) => w == currentDay)) {
          messages.push({
            title: "Hey " + habit.createdBy.username + "!! You ready ??🚀 ",
            body: "You have to start " + habit.title + " within an hour ..! ⏲️",
            sender: habit.createdBy,
          });
          habitsToNotify.push(habit);
        }
      }
    }
    if (moment(habit.lastNotifiedDate.duringHabit).date() < moment().date()) {
      if (difference <= 10 && difference >= 0) {
        console.log("REACHED HERE", habit.weeksSelected);
        if (habit.weeksSelected[0].split(",").find((w) => w == currentDay)) {
          messages.push({
            title: "Hey " + habit.createdBy.username + "!! You ready ??🚀 ",
            body: "You have to start " + habit.title + " shortly ..! ⏲️",
            sender: habit.createdBy,
          });
          habitsToNotify.push(habit);
        }
      }
    }
    console.log(messages);

    if (messages) {
      messages.map(async (message) => {
        const messageToSend = {
          android: {
            notification: {
              title: message.title,
              body: message.body,
            },
          },

          token: message.sender.fcm_token,
        };
        try {
          const response = await getMessaging().send(messageToSend);
          console.log(response);
          notificationSent.push(habit._id);
          if (difference <= 65 && difference >= 55) {
            const modified = JSON.parse(JSON.stringify(habit.lastNotifiedDate));
            modified.beforeOneHour = moment(modified.beforeOneHour)
              .add(1, "day")
              .toISOString();

            habit.lastNotifiedDate = modified;
            await habit.save();
          }
          if (difference <= 35 && difference >= 25) {
            const modified = JSON.parse(JSON.stringify(habit.lastNotifiedDate));
            modified.beforeHalfHour = moment(modified.beforeHalfHour)
              .add(1, "day")
              .toISOString();
            console.log("MODIFIED", modified);

            habit.lastNotifiedDate = modified;
            await habit.save();
          }
          if (difference <= 10 && difference >= 0) {
            const modified = JSON.parse(JSON.stringify(habit.lastNotifiedDate));
            modified.duringHabit = moment(modified.duringHabit)
              .add(1, "day")
              .toISOString();
            console.log("MODIFIED", moment(modified.duringHabit).date());

            habit.lastNotifiedDate = modified;
            await habit.save();
          }

          console.log("NOTIFICATION SENT SUCCESSFULLY");
        } catch (error) {
          console.log("NOTIFICATION SENDING FAILED", error);
        }
      });
    }
  });
  await habits.save();
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
    server.listen(5000, "0.0.0.0");
  } catch (error) {
    console.log("working offline..!");
    server.listen(5000, "0.0.0.0");
  }
};
start();
