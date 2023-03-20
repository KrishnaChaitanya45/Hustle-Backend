require("dotenv").config();
const jwt = require("jsonwebtoken");
const authenticateJWT = (req, res, next) => {
  try {
    const token = req.cookies.DearDiaryAuthentication;
    if (token) {
      jwt.verify(token, process.env.SECRET, (err, user) => {
        if (err) {
          return res.sendStatus(403);
        }
        req.user = user.id;
        next();
      });
    }
  } catch (error) {
    const userId = req.params.userId;
    if (userId) {
      req.user = userId;
      next();
    } else {
      return res.sendStatus(403);
    }
  }
};
module.exports = authenticateJWT;
