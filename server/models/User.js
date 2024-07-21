const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  profilePicture: { type: String },
  email: { type: String, required: true },
  password: { type: String },
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
});

const User = mongoose.model("User", userSchema);
module.exports = User;
