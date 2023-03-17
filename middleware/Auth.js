require("dotenv").config();
const jwt = require("jsonwebtoken");
const authenticateJWT = (req, res, next) => {
  const token = req.cookies.DearDiaryAuthentication;
  if (token) {
    jwt.verify(token, process.env.SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user.id;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};
module.exports = authenticateJWT;
