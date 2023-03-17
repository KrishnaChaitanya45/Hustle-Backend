const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "../uploads");
  },
  filename: (re, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });
