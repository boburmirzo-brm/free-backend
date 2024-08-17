import express from "express";
import dotenv from "dotenv";
import monngose from "mongoose";
import cors from "cors";
import Routes from "./routes/index.js";
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

monngose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("MongoDB is connected"))
  .catch((err) => console.log(err));

app.use("/", Routes);

app.use(express.urlencoded({ extended: true }));
app.use("/images", express.static("./files"));

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`${PORT} has been listening`));
