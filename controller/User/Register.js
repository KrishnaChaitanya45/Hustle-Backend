const UserModel = require("../../models/User/User");
const MainTaskModel = require("../../models/GoalTracker/MainTask");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const getAllMainTasks = async (req, res) => {
  const allMainTasks = await MainTaskModel.find({ createdBy: req.body.user });
  //TODO: add a user middleware to add the user to the req object
  return res.status(200).json({ allMainTasks });
};

const createNewUser = async (req, res) => {
  console.log("request recieved");
  const { email, password, username, name, bio, interests, targetTasks, upto } =
    req.body;
  let token;
  try {
    const userExists = await UserModel.find({
      email: email,
      username: username,
    });
    if (userExists.length > 1) {
      return res
        .status(401)
        .json({ msg: "User Exists Please Try Logging In..!" });
    } else {
      try {
        try {
          const profileImage = req.file.path;
          const hashedPassword = await bcrypt.hash(password, 16);
          const user = await UserModel.create({
            email,
            username,
            name,
            bio,
            interests,
            password: hashedPassword,
            profilePhoto: profileImage,
            targetTasks,
            upto,
          });
          try {
            token = jwt.sign({ id: user._id }, process.env.SECRET);
            user.tokens = user.tokens.concat({ token: token });
            await user.save();
          } catch (error) {
            console.log(error);
            return error;
          }
          console.log(token);
          res.cookie("DearDiaryAuthentication", token);
          return res
            .status(201)
            .json({ msg: "User Created..!", user: user, token: token });
        } catch (error) {
          const hashedPassword = await bcrypt.hash(password, 16);
          const user = await UserModel.create({
            email,
            username,
            name,
            bio,
            interests,
            password: hashedPassword,
            upto,
          });

          try {
            token = jwt.sign({ id: user._id }, process.env.SECRET);
            user.tokens = user.tokens.concat({ token: token });
            user.target.targetTasks = targetTasks;
            await user.save();
          } catch (error) {
            console.log(error);
            return error;
          }
          console.log(token);
          res.cookie("DearDiaryAuthentication", token);
          return res.status(222).json({ msg: "Creation failed" });
        }
      } catch (error) {
        return res.status(500).json({ msg: error });
      }
    }
  } catch (error) {
    return res.status(402).json({ msg: "something went wrong" });
  }
};
const getUserInfo = async () => {};
const updateUserProfile = async () => {};

module.exports = {
  createNewUser,
};
