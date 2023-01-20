const Post = require("../model/post");
const User = require("../model/user");
const createPost = async (req, res) => {
  try {
    const newPostData = {
      caption: req.body.caption,
      image: {
        public_id: "req.body.public_id",
        url: "req.body.url",
      },
      owner: req.user._id,
    };
    const newPost = new Post(newPostData);
    await newPost.save();
    // const newPost = await Post.create(newPostData);
    const user = await User.findById(req.user._id);
    user.posts.push(newPost._id);
    await user.save();

    res.status(201).json({
      success: true,
      post: newPost,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "post not found",
      });
    }
    if (post.owner.toString() !== req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorised",
      });
    }

    await post.remove();
    res.status(200).json({ success: true, message: "post deleted" });
    const user = await User.findById(req.user._id);
    const index = await User.posts.indexOf(req.params.id);
    user.post.splice(index, 1);
    await user.save();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.likeAndUnlikepost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "post not found",
      });
    }
    if (post.like.includes(req.user._id)) {
      const index = post.like.indexOf(req.user._id);
      post.likes.splice(index, 1);
      await post.save();
      return res.status(200).json({ success: true, message: "POST unliked" });
    } else {
      post.likes.push(req.user._id);

      await post.save();
      return res.status(200).json({ success: true, message: "post is liked" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getPostOfFollowing = async (req, res) => {
  try {
    // const user = await User.findById(req.user._id).populate(
    //   "following",
    //   "posts"
    // );
    const user = await User.findById(req.user._id);
    const posts = await User.find({
      owner: {
        $in: user.following,
      },
    });
    res.status(200).json({ success: true, posts });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateCaption = async (req, res) => {
  try {
    const post = await User.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "post not found",
      });
      if (post.owner.toString() !== req.user._id.toString()) {
        return res.status(401).json({
          success: false,
          message: "Unauthorised",
        });
      }
      post.caption = req.body.captions;
      await post.save();
      res.status(200).json({ success: true, message: "updated caption" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.commentOnPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post Not Found",
      });
    }
    let commentIndex = -1;
    // checking comments already exists
    post.comments.forEach((item, index) => {
      if (item.user.toString() === req.user._id.toString()) {
        commentIndex = index;
      }
    });
    if (commentExists !== -1) {
      post.comments[commentIndex].comment = req.body.comment;
      await post.save();
      return res.status(200).json({
        success: true,
        message: "comment updated",
      });
    } else {
      post.comments.push({ user: req.user._id, comment: req.body.comment });
      await post.save();
      return res.status(200).json({ success: true, message: "comment added" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "post not found" });
    }

    //checking if owner wants to delete
    if (post.owner.toString() === req.user._id.toString()) {
      if (req.body.commentId == undefined) {
        return res
          .status(400)
          .json({ success: false, message: "CommentId required " });
      }
      post.comments.forEach((item, index) => {
        if (item._id.toString() === req.body.commentId.toString()) {
          return post.comments.splice(index, 1);
        }
      });

      await post.save();
      return res
        .status(200)
        .json({ success: true, message: "selected comment deleted" });
    } else {
      post.comments.forEach((item, index) => {
        if (item.user.toString() === req.user._id.toString()) {
          return post.comments.splice(index, 1);
        }
      });
      await post.save();
      res.status(200).json({
        success: true,
        message: "Your comment has deleted",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = createPost;
