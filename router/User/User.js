const express = require("express");
const router = express.Router();
const { createNewUser } = require("../../controller/User/Register");
const { loginUser, getASingleUser } = require("../../controller/User/Login");
const authenticateJWT = require("../../middleware/Auth");
const setCache = require("../../middleware/Cache");

router.route("/register/").post(createNewUser);
router.route("/login/").post(loginUser);
router.route("/login/user-details").get(authenticateJWT, getASingleUser);

module.exports = router;
