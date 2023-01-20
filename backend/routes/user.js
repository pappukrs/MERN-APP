const express = require("express");
const {
  register,
  login,
  followUser,
  logout,
  deleteMyProfile,
  myProfile,
  getUserProfile,
  forgotPassword,
} = require("../controllers/user");
const { isAuthenticated } = require("../middlewares/auth");
const Userrouter = express.Router();
// router.route("/post/upload").post();
Userrouter.post("/register", register);
Userrouter.post("/login", login);
Userrouter.get("/logout", logout);
Userrouter.get("/follow/:id", isAuthenticated, followUser);
Userrouter.patch("/update/password", isAuthenticated, updatePassword);
Userrouter.patch("/update/Profile", isAuthenticated, updateProfile);
Userrouter.delete("delete/me", isAuthenticated, deleteMyProfile);
Userrouter.get("/me", isAuthenticated, myProfile);
Userrouter.get("/user/:id", isAuthenticated, getUserProfile);
Userrouter.get("/users", isAuthenticated, getAllUsers);
Userrouter.post("/forgot/password", isAuthenticated, forgotPassword);
Userrouter.post("/password/reset/:token", isAuthenticated, updatePassword);
module.exports = Userrouter;
