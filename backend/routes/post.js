const express = require("express");
const {
  createPost,
  likeAndUnlikepost,
  deletePost,
  getPostOfFollowing,
  updateCaption,
  addComent,
} = require("../controllers/post");
const { isAuthenticated } = require("../middlewares/auth");
console.log(createPost, "createPost");
const Postrouter = express.Router();
// router.route("/post/upload").post(createPost);
Postrouter.post("/post/upload", isAuthenticated, createPost);
Postrouter.get("/post/:id", isAuthenticated, likeAndUnlikepost);
Postrouter.patch("/post/:id", isAuthenticated, updateCaption);
Postrouter.delete("/post/:id", isAuthenticated, deletepost);
Postrouter.get("/posts", isAuthenticated, getPostOfFollowing);
Postrouter.post("/posts/comment/:id", isAuthenticated, commentOnPost);
Postrouter.delete("/posts/comment/:id", isAuthenticated, deleteComment);
module.exports = Postrouter;
