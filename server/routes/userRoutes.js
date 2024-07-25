const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { bucket } = require("../firebaseAdmin.js");
const User = require("../models/User.js");
const isAuth = require("../validators/isAuth.js");
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/register", upload.single("profileImage"), async (req, res) => {
  const { username, email, password } = req.body;
  const profileImage = req.file;

  if (profileImage) {
    const blob = bucket.file(profileImage.originalname + email);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });

    blobStream.on("error", (err) => {
      console.error("Error uploading file:", err);
    });

    blobStream.on("finish", async () => {
      console.log("File uploaded successfully");
    });

    blobStream.end(profileImage.buffer);
  }

  const user = new User({
    name: username,
    email,
    password,
    profilePicture: profileImage ? profileImage.originalname + email : null,
  });
  await user.save();
  res.status(201).send(user);
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || user.password !== password) {
    return res.status(401).send({ message: "Invalid email or password" });
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.send({
    token,
  });
});

router.get("/profile", isAuth, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.send(user);
});

router.get("/myProfilePicture", isAuth, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user.profilePicture) {
    const blob = bucket.file(user.profilePicture);
    const blobStream = blob.createReadStream();
    blobStream.pipe(res);
  } else {
    res.status(404).send({ message: "File not found" });
  }
});

router.get("/profilePicture/:id", async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user.profilePicture) {
    const blob = bucket.file(user.profilePicture);
    const blobStream = blob.createReadStream();
    blobStream.pipe(res);
  } else {
    res.status(404).send({ message: "File not found" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.send({ message: "Logged out" });
});

module.exports = router;
