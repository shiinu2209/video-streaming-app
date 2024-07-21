const express = require("express");
const multer = require("multer");
const { bucket } = require("../firebaseAdmin.js");
const Video = require("../models/Video.js");
const isAuth = require("../validators/isAuth.js");
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get all videos
router.get("/videos", async (req, res) => {
  try {
    const videos = await Video.find().populate("user");
    const sortedVideos = videos.sort((a, b) => b.createdAt - a.createdAt);
    res.status(200).send(sortedVideos);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

//get thumbnail
router.get("/thumbnail/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).send("Video not found");
    }

    const blob = bucket.file(video.thumbnailUrl.split("/").pop());
    const stream = blob.createReadStream();
    stream.pipe(res);
  } catch (error) {
    console.error("Error fetching the thumbnail:", error);
    res.status(500).send({ message: error.message });
  }
});

// Upload API
router.post(
  "/upload",
  isAuth,
  upload.fields([{ name: "video" }, { name: "thumbnail" }]),
  async (req, res) => {
    if (!req.files || !req.files.video || !req.files.thumbnail) {
      return res.status(400).send("Video or thumbnail file not uploaded.");
    }

    const videoFile = req.files.video[0];
    const thumbnailFile = req.files.thumbnail[0];
    if (
      videoFile.mimetype !== "video/mp4" &&
      videoFile.mimetype !== "video/ogg" &&
      videoFile.mimetype !== "video/webm"
    ) {
      return res
        .status(400)
        .send("Only mp4, ogg, and webm video files are allowed.");
    }
    if (
      thumbnailFile.mimetype !== "image/jpeg" &&
      thumbnailFile.mimetype !== "image/png"
    ) {
      return res.status(400).send("Only jpeg and png image files are allowed.");
    }

    const videoBlob = bucket.file(videoFile.originalname + Date.now());
    const thumbnailBlob = bucket.file(thumbnailFile.originalname + Date.now());

    const videoBlobStream = videoBlob.createWriteStream({
      metadata: {
        contentType: videoFile.mimetype,
      },
    });

    const thumbnailBlobStream = thumbnailBlob.createWriteStream({
      metadata: {
        contentType: thumbnailFile.mimetype,
      },
    });

    videoBlobStream.on("error", (err) => {
      res.status(500).send({ message: err.message });
    });

    thumbnailBlobStream.on("error", (err) => {
      res.status(500).send({ message: err.message });
    });

    videoBlobStream.on("finish", async () => {
      const videoUrl = `https://storage.googleapis.com/${bucket.name}/${videoBlob.name}`;
      thumbnailBlobStream.on("finish", async () => {
        const thumbnailUrl = `https://storage.googleapis.com/${bucket.name}/${thumbnailBlob.name}`;
        const newVideo = new Video({
          user: req.user._id,
          title: req.body.title,
          description: req.body.description,
          videoUrl: videoUrl,
          thumbnailUrl: thumbnailUrl,
          contentType: videoFile.mimetype,
        });
        const user = req.user;
        user.videos.push(newVideo._id);
        await user.save();

        try {
          const savedVideo = await newVideo.save();
          res.status(201).send(savedVideo);
        } catch (error) {
          res.status(500).send({ message: error.message });
        }
      });

      thumbnailBlobStream.end(thumbnailFile.buffer);
    });

    videoBlobStream.end(videoFile.buffer);
  }
);

// Stream API
router.get("/video/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).send("Video not found");
    }

    const blob = bucket.file(video.videoUrl.split("/").pop());
    const range = req.headers.range;

    if (!range) {
      return res.status(400).send("Requires Range header");
    }

    const metadata = await blob.getMetadata();
    const videoSize = metadata[0].size;

    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    const contentLength = end - start + 1;
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": video.contentType,
    };

    res.writeHead(206, headers);

    const stream = blob.createReadStream({ start, end });
    stream.pipe(res);
  } catch (error) {
    console.error("Error fetching the video:", error);
    res.status(500).send({ message: error.message });
  }
});

router.get("/myVideos", isAuth, async (req, res) => {
  try {
    const user = req.user;
    await user.populate({
      path: "videos",
      populate: { path: "user" },
    });
    res.status(200).send(user.videos);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.delete("/deleteVideo/:id", isAuth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).send("Video not found");
    }
    if (String(video.user) !== String(req.user._id)) {
      return res
        .status(403)
        .send("You are not authorized to delete this video");
    }

    await bucket.file(video.videoUrl.split("/").pop()).delete();
    await bucket.file(video.thumbnailUrl.split("/").pop()).delete();

    await video.deleteOne();
    const user = req.user;
    user.videos = user.videos.filter(
      (v) => String(v) !== String(req.params.id)
    );
    await user.save();

    res.status(200).send("Video deleted successfully");
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/videoDetails/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate("user");
    if (!video) {
      return res.status(404).send("Video not found");
    }
    res.status(200).send(video);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.post("/like/:id", isAuth, async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) {
    return res.status(404).send("Video not found");
  }
  if (video.likes.includes(req.user._id)) {
    video.likes = video.likes.filter(
      (id) => String(id) !== String(req.user._id)
    );
  } else {
    video.likes.push(req.user._id);
  }
  await video.save();
  res.status(200).send({
    isLiked: video.likes.includes(req.user._id),
    likes: video.likes.length,
  });
});

router.get("/isLiked/:id", isAuth, async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) {
    return res.status(404).send("Video not found");
  }
  res.status(200).send(video.likes.includes(req.user._id));
});

router.post("/comment/:id", isAuth, async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) {
    return res.status(404).send("Video not found");
  }
  video.comments.push({
    userId: req.user._id,
    text: req.body.text,
  });
  await video.save();
  res.status(200).send(video);
});

router.get("/comments/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate({
      path: "comments.userId",
      model: "User",
    });

    if (!video) {
      return res.status(404).send("Video not found");
    }
    const sortedComments = video.comments.sort(
      (a, b) => b.createdAt - a.createdAt
    );

    res.status(200).send(video.comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).send({ message: error.message });
  }
});

router.delete("/comment/:id/:commentId", isAuth, async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) {
    return res.status(404).send("Video not found");
  }
  const comment = video.comments.find(
    (comment) => String(comment._id) === String(req.params.commentId)
  );
  if (!comment) {
    return res.status(404).send("Comment not found");
  }
  if (String(comment.userId) !== String(req.user._id)) {
    return res
      .status(403)
      .send("You are not authorized to delete this comment");
  }
  video.comments = video.comments.filter(
    (comment) => String(comment._id) !== String(req.params.commentId)
  );
  await video.save();
  res.status(200).send(video);
});

module.exports = router;
