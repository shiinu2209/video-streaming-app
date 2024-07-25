const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Connect to MongoDB
const connectDB = require("./config.js");
connectDB();

const videoRoutes = require("./routes/videoRoutes.js");
const userRoutes = require("./routes/userRoutes.js");

app.use(
  cors({
    origin: "https://vid-streamer.netlify.app/",
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", videoRoutes);
app.use("/", userRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server started on port 3000");
});
