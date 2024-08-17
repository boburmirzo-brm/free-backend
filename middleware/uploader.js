import multer from "multer";
import { v4 } from "uuid";

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./files");
  },
  filename: function (req, file, callback) {
    callback(null, v4() + "-" + file.originalname);
  },
});

export const uploader = multer({ storage });
