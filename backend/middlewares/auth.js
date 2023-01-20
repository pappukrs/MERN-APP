const User = require("../model/user");
const jwt = require("jsonwebtoken");

exports.isAuthenticated = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    // console.log(token);
    // console.log(req.cookies.token);
    if (!token) {
      return res.status(401).json({ message: "please login first" });
    }
    const decoded = await jwt.verify(token, process.env.secretKey);
    req.user = await User.findById(decoded._id);
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
