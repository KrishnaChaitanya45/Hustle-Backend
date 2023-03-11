const UserModel = require("../../models/User/User");
const MainTaskModel = require("../../models/GoalTracker/MainTask");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.find({ email: email });
    if (user) {
      const isMatch = await bcrypt.compare(password, user[0].password);
      if (!isMatch) {
        return res.status(401).json({ msg: "Invalid Credentials" });
      }
      const token = await user[0].generateAuthToken();
      res.cookie("DearDiaryAuthentication", token);
      return res
        .status(200)
        .json({ msg: "Login Successful", user: user[0], token: token });
    }
  } catch (error) {
    return res.status(401).json({ msg: "Invalid Credentials" });
  }
};
const getASingleUser = async (req, res) => {
  const id = mongoose.Types.ObjectId(req.user);
  try {
    const user = await UserModel.findById(id);

    return res.status(200).json({ user: user });
  } catch (error) {
    return res.status(404).json({ msg: "User Not Found" });
  }
};
module.exports = {
  loginUser,
  getASingleUser,
};
