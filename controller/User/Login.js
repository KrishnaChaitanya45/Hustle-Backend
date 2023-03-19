const UserModel = require("../../models/User/User");
const MainTaskModel = require("../../models/GoalTracker/MainTask");
const mongoose = require("mongoose");
const { getOrSetRedis } = require("../../utils/Get_or_Set_Redis");
const jwt = require("jsonwebtoken");
// const redis = require("ioredis");
// const client = new redis({
//   port: process.env.REDIS_PORT,
//   host: process.env.REDIS_HOST,
//   password: process.env.REDIS_PASS,
// });

require("dotenv").config();
const bcrypt = require("bcrypt");

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  // const user = await client.get(`user${email}`, async (err, data) => {
  //   if (err) throw err;
  //   if (data !== null) return JSON.parse(data);
  // });
  // if (user) {
  //   return res
  //     .status(200)
  //     .json({ msg: "Login Successful", user: JSON.parse(user) });
  // } else {
  try {
    // console.log(password);
    const user = await UserModel.find({ email: email });
    // console.log(await bcrypt.compare(password, user[0].password));
    // console.log(user);
    if (user) {
      const isMatch = await bcrypt.compare(password, user[0].password);

      if (!isMatch) {
        return res.status(401).json({ msg: "Invalid Credentials" });
      }
      const token = await user[0].generateAuthToken();
      // client.set(`user${email}`, JSON.stringify(user[0]));
      res.cookie("DearDiaryAuthentication", token);
      return res
        .status(200)
        .json({ msg: "Login Successful", user: user[0], token: token });
    }
  } catch (error) {
    return res.status(500).json({ msg: "Error from the server" });
  }
};
// };
const getASingleUser = async (req, res) => {
  const token = req.params.id;
  const decoded = await jwt.verify(token, process.env.SECRET);
  const userId = decoded.id;
  const id = mongoose.Types.ObjectId(userId);
  // client.get("user", async (err, data) => {
  //   if (err) throw err;
  //   if (data !== null) {
  //     return res.status(200).json({ user: JSON.parse(data) });
  //   } else {
  // try {
  try {
    const user = await UserModel.findById(id);

    return res.status(200).json({ user: user });
  } catch (error) {
    return res.status(404).json({ msg: "User Not Found" });
  }
  // client.set("user", JSON.stringify(user));

  // } catch (error) {
  //   return res.status(404).json({ msg: "User Not Found" });
  // }
  //   }
  // });
  // let userData = await getOrSetRedis("user", async () => {
  //   const user = await UserModel.findById(id);
  //   return user;
  // });
  // console.log(userData);
  // return res.status(200).json({ user: userData });
};
module.exports = {
  loginUser,
  getASingleUser,
};
