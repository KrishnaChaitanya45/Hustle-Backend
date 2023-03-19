const express = require("express");
const router = express.Router();
const { createNewUser } = require("../../controller/User/Register");
const { loginUser, getASingleUser } = require("../../controller/User/Login");
const authenticateJWT = require("../../middleware/Auth");
const setCache = require("../../middleware/Cache");
const singleUpload = require("../../middleware/multer");
router.route("/register/").post(singleUpload, createNewUser);
router.route("/login/").post(loginUser);
router.route("/login/user-details/:id").get(getASingleUser);

module.exports = router;
