const jwt = require("jsonwebtoken");
const User = require("../models/User.js");

const isAuth = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send({ message: "Token is not supplied" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return res.status(401).send({ message: "Invalid token" });
  }
};

module.exports = isAuth;
