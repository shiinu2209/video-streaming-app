const mongoose = require("mongoose");

const Comment = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const videoSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  comments: [Comment],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  title: { type: String, required: true },
  description: { type: String },
  videoUrl: { type: String, required: true },
  contentType: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Video = mongoose.model("Video", videoSchema);

module.exports = Video;
