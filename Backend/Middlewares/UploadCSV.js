const multer = require("multer");

const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "text/csv") {
      cb(new Error("Chỉ cho phép file CSV"));
    }
    cb(null, true);
  }
});

module.exports = upload;
