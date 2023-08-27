const { default: mongoose } = require("mongoose");
const HabitModel = require("../../models/GoalTracker/Habit");
const UserModel = require("../../models/User/User");
const getDataURI = require("../../utils/DataURI");
const cloudinary = require("cloudinary").v2;
const moment = require("moment");
const createHabit = async (req, res) => {
  let image,
    image_url = undefined;
  try {
    const {
      title,
      description,
      startTime,
      status,
      duration,
      endTime,
      createdBy,
      imageFromBody,
      weeksSelected,
    } = req.body;

    const id = mongoose.Types.ObjectId(createdBy);
    const user = await UserModel.findById(id);
    console.log("== REQ FILE ==", req.file);
    console.log("== REQ BODY ==", req.body);
    if (req.file) {
      try {
        image = getDataURI(req.file);
        image_url = await cloudinary.uploader.upload(image.content, {
          public_id: `DearDiary/${user.username}/HabitIcons/${
            title.split(" ")[0]
          }`,
        });
      } catch (error) {
        return res.status(500).json({
          msg: "IMAGE UPLOAD FAILED",
          error: error,
          errorMes: error.message,
        });
      }
    }

    try {
      const newHabit = await HabitModel.create({
        title,
        description,
        startTime: JSON.parse(startTime),
        duration: JSON.parse(duration),
        status,
        lastNotifiedDate: {
          beforeHalfHour: moment().subtract(1, "day").toISOString(),
          beforeOneHour: moment().subtract(1, "day").toISOString(),
          duringHabit: moment().subtract(1, "day").toISOString(),
        },
        endTime: JSON.parse(endTime),
        habitIcon: image_url ? image_url.secure_url : imageFromBody,
        weeksSelected,
        createdBy: id,
      });
      const user = await UserModel.findById(id);
      user.habits.push(newHabit);
      await user.save();
      return res.status(201).json({ msg: "Habit Created", habit: newHabit });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ msg: "Request Failed" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "REQUEST BODY INVALID" });
  }
};
const getHabits = async (req, res) => {
  let id;
  if (req.user) {
    id = mongoose.Types.ObjectId(req.user);
  }
  id = mongoose.Types.ObjectId(req.params.userId);
  const allHabits = await HabitModel.find({ createdBy: id });
  return res.status(200).json({ habits: allHabits });
};
const getAHabit = async (req, res) => {};
const updateHabit = async (req, res) => {
  let userId;
  try {
    if (req.user) {
      userId = mongoose.Types.ObjectId(req.user);
    }
    const { id } = req.params;
    const { status, date, percentage, startTime, endTime } = req.body;
    const habitId = mongoose.Types.ObjectId(id);
    userId = mongoose.Types.ObjectId(req.body.userId);
    const habit = await HabitModel.find({ _id: habitId, createdBy: userId });
    if (!habit) {
      return res.status(404).json({ msg: "Habit Not Found" });
    }

    const existingDay = habit[0].dates.find((day) => {
      return (
        new Date(day.date).toDateString() === new Date(date).toDateString()
      );
    });

    if (existingDay) {
      existingDay.status = status;
      existingDay.endTime = endTime;
      existingDay.percentage = percentage;
    } else {
      habit[0].startTime = startTime;
      if (endTime) {
        habit[0].endTime = endTime;
      }
      habit[0].dates.push({ date, status, percentage: percentage });
    }

    if (status === "completed") {
      habit[0].dates.push({
        date: Date.now(),
        status: "done",
        percentage: percentage,
      });
    }
    await habit[0].save();
    return res.status(200).json({ msg: "Habit Updated", habit });
  } catch (error) {
    return res.status(500).json({ msg: error });
  }
};
const deleteAHabit = async (req, res) => {};
const addFriend = async (req, res) => {
  const { userId } = req.params;
  const { friendId } = req.body;
  if (!userId || !friendId) {
    return res.status(400).json({ msg: "Please provide userId and friendId" });
  }
  if (userId === friendId) {
    return res.status(400).json({ msg: "You can't add yourself as a friend" });
  }
  try {
    const friend = await UserModel.findById(friendId);
    if (!friend) {
      return res.status(404).json({ msg: "Friend Not Found" });
    }
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: "User Not Found" });
      }
      const userFriends = user.friends;
      const friendExits = userFriends.find((friend) => {
        return friend._id.toString() === friendId.toString();
      });
      if (friendExits) {
        return res.status(400).json({ msg: "Friend Already Exists" });
      }
      // user.friends.push(friend);
      if (
        friend.friendRequests.find(
          (id) => id.from.toString() === userId.toString()
        )
      ) {
        return;
      }
      friend.friendRequests.push({ from: userId, accepted: false });
      console.log(friend.friendRequests);
      await user.save();
      await friend.save();
      // const friends = await UserModel.findById(userId).populate(
      //   "friends",
      //   "-password"
      // );
      // return res
      //   .status(201)
      //   .json({ msg: "Friend Added", friends: friends.friends });
      return res.status(201).json({ msg: "Friend Request Sent" });
    } catch (error) {
      return res.status(500).json({ msg: "Friend Addition failed" });
    }
  } catch (error) {
    return res.status(500).json({ msg: "Fetching friend failed" });
  }
};

const acceptOrRejectFriendRequest = async (req, res) => {
  const { userId } = req.params;
  const { requestId, DidTheReceiverAccept } = req.body;
  if (!userId || !requestId) {
    return res.status(400).json({ msg: "Please provide userId and friendId" });
  }
  console.log("REACHED HERE", userId, requestId, DidTheReceiverAccept);
  try {
    const user = await UserModel.findById(userId).populate(
      "friendRequests.from",
      "-password"
    );
    console.log("REACHED HERE - 2", user);
    if (!user) {
      return res.status(404).json({ msg: "User Not Found" });
    }
    if (!DidTheReceiverAccept) {
      const filteredRequests = user.friendRequests.filter((request) => {
        return request._id.toString() !== requestId.toString();
      });
      user.friendRequests = filteredRequests;
      await user.save();
      return res.status(201).json({ msg: "Friend Request Rejected" });
    }
    const friendRequest = user.friendRequests.find((friendRequest) => {
      return friendRequest._id.toString() === requestId.toString();
    });
    console.log("REACHED HERE - 3", friendRequest);
    if (!friendRequest) {
      return res.status(404).json({ msg: "Friend Request Not Found" });
    }
    const friend = await UserModel.findById(friendRequest.from._id);
    console.log("REACHED HERE - 4", friend);
    if (!friend) {
      return res.status(404).json({ msg: "Friend Not Found" });
    }
    const userFriends = user.friends;
    const friendExits = userFriends.find((friend) => {
      return friend._id.toString() === friendRequest.from._id.toString();
    });
    if (friendExits) {
      return res.status(400).json({ msg: "Friend Already Exists" });
    }
    user.friends.push(friend);
    friend.friends.push(user);
    const filteredRequests = user.friendRequests.filter((request) => {
      return request._id.toString() !== requestId.toString();
    });
    user.friendRequests = filteredRequests;
    await user.save();

    await friend.save();
    const friends = await UserModel.findById(userId).populate(
      "friends",
      "-password"
    );
    return res
      .status(201)
      .json({ msg: "Friend Added", friends: friends.friends });
  } catch (error) {
    return res.status(500).json({ msg: "Fetching friend failed" });
  }
};

const getFriendRequests = async (req, res) => {
  const { userId } = req.params;
  console.log("REACHED HERE", userId);
  if (!userId) {
    return res.status(400).json({ msg: "Please provide userId" });
  }
  try {
    const user = await UserModel.findById(userId).populate(
      "friendRequests.from",
      "-password"
    );
    if (!user) {
      return res.status(404).json({ msg: "User Not Found" });
    }
    const friendRequests = user.friendRequests;
    console.log(friendRequests);
    return res
      .status(200)
      .json({ msg: "Friend Requests Fetched", friendRequests });
  } catch (error) {
    return res.status(500).json({ msg: "Fetching friend requests failed" });
  }
};
const getAllFriends = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ msg: "Please provide userId" });
  }
  try {
    const friends = await UserModel.findById(userId).populate(
      "friends",
      "-password"
    );
    return res
      .status(200)
      .json({ msg: "Friends Fetched", friends: friends.friends });
  } catch (error) {
    return res.status(500).json({ msg: "Fetching friends failed" });
  }
};
const removeFriend = async (req, res) => {
  const { friendId, userId } = req.params;
  if (!userId || !friendId) {
    return res.status(400).json({ msg: "Please provide userId and friendId" });
  }
  if (userId.toString() === friendId.toString()) {
    return res.status(400).json({ msg: "You can't remove yourself" });
  }
  try {
    const friend = await UserModel.findById(friendId);
    if (!friend) {
      return res.status(404).json({ msg: "Friend Not Found" });
    }
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: "User Not Found" });
      }
      const userFriends = user.friends;
      const friendExits = userFriends.find((friend) => {
        return friend.toString() === friendId.toString();
      });
      if (!friendExits) {
        return res.status(400).json({ msg: "Friend Doesn't Exists" });
      }
      const filteredFriends = userFriends.filter((friend) => {
        return friend._id.toString() !== friendId.toString();
      });
      user.friends = filteredFriends;
      const filteredUser = friend.friends.filter((friend) => {
        return friend._id.toString() !== userId.toString();
      });
      friend.friends = filteredUser;
      await user.save();
      await friend.save();
      const friends = await UserModel.findById(userId).populate(
        "friends",
        "-password"
      );
      return res
        .status(201)
        .json({ msg: "Friend Removed", friends: friends.friends });
    } catch (error) {
      return res.status(500).json({ msg: "Friend Addition failed" });
    }
  } catch (error) {
    return res.status(500).json({ msg: "Removing friend failed" });
  }
};
const getFriend = async (req, res) => {
  const { friendId, userId } = req.params;
  if (!friendId || !userId) {
    return res.status(400).json({ msg: "Please provide friendId and userId" });
  }
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User Not Found" });
    }
    let friend = user.friends.find((friend) => {
      return friend._id.toString() === friendId.toString();
    });
    if (!friend) {
      return res.status(404).json({ msg: "Friend Not Found" });
    }
    friend = await UserModel.findById(userId).populate("friends", "-password");

    return res.status(200).json({ msg: "Friend Fetched", friend });
  } catch (error) {
    return res.status(500).json({ msg: "Fetching friend failed" });
  }
};
const getAllUsers = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ msg: "Please provide userId" });
  }
  try {
    const users = await UserModel.find({ _id: { $ne: userId } });
    return res.status(200).json({ msg: "Users Fetched", users });
  } catch (error) {
    return res.status(500).json({ msg: "Fetching users failed" });
  }
};
module.exports = {
  createHabit,
  getHabits,
  getAHabit,
  addFriend,
  getAllFriends,
  updateHabit,
  getFriend,
  removeFriend,
  deleteAHabit,
  getAllUsers,
  getFriendRequests,
  acceptOrRejectFriendRequest,
};
