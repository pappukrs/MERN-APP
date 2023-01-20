const User = require("../model/user");
const Post = require("../model/post");
const { sendEmail } = require("../middlewares/sendEmail");
const { crypto } = require("crypto");
console.log("User", User);
const register = async (req, res) => {
  const { name, email, password } = req.body;
  console.log(name, email, password);
  try {
    let user = await User.find({ email });
    // console.log(user, "user");
    if (user.length > 0) {
      res.status(400).json({ success: false, message: "User already exist" });
      return;
    }
    user = new User({
      name,
      email,
      password,
      avatar: { public_id: "sample id", url: "sample url" },
    });
    await user.save();
    const token = await user.generateToken();
    const options = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };
    res
      .status(201)
      .cookie("token", token, options)
      .json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  //   console.log(email, password);
  try {
    let user = await User.find({ email }).select("+password");
    if (!user.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "User doest not exist" });
    }
    const isMatch = await user.passwordMatches(password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect password" });
    }
    const token = await user.generateToken();
    const options = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };
    res
      .status(200)
      .cookie("token", token, options)
      .json({ success: true, user });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.logout = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", null, { expires: new Date(Date.now()), httpOnly: true })
      .json({ success: true, message: "logout" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.followUser = async (req, res) => {
  try {
    const userTofollow = await User.findById(req.params.id);
    const loggedInUser = await User.findById(req.user._id);
    if (!userTofollow) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (loggedInUser.following.includes(userTofollow._id)) {
      const indexfollowing = loggedInUser.following.indexOf(userTofollow._id);
      loggedInUser.following.splice(indexfollowing, 1);

      const indexfollowers = userTofollow.followers.indexof(loggedInUser._id);
      userTofollow.followers.splice(indexfollowers, 1);
      await loggedInUser.save();
      await userTofollow.save();
      res.status(200).json({
        success: true,
        message: "User Unfollowed",
      });
    } else {
      loggedInUser.following.push(userTofollow._id);
      userTofollow.following.push(loggedInUser._id);
      await loggedInUser.save();
      await userTofollow.save();
      res.status(200).json({
        success: true,
        message: "User followed",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(403).json({
        success: false,
        message: "Please provie old and new password",
      });
    }
    const isMatch = await user.isMatch(oldPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Old password",
      });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({
      success: true,
      message: "password updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, email } = req.body;
    if (name) {
      user.name = name;
    }
    if (email) {
      user.email = email;
    }
    // User Avatar:Todo
    await user.save();
    res.status(200).json({
      success: true,
      message: "profile updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.deleteMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const posts = user.posts;
    const followers = user.followers;
    const userId = user._id;
    await user.remove();

    //logout user after deleting profile;
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    //Delete all posts of the user
    for (let i = 0; i < posts.length; i++) {
      const post = await Post.findById(posts[i]);
      await post.remove();
    }
    // Removing User from followers following

    for (let i = 0; i < followers.length; i++) {
      const follower = await User.findById(followers[i]);
      const index = follower.following.indexOf(userId);
      follower.following.splice(index, 1);
      await follower.save();
    }

    // Removing User from  following's followers

    for (let i = 0; i < following.length; i++) {
      const follows = await User.findById(following[i]);
      const index = follows.followers.indexOf(userId);
      follows.followers.splice(index, 1);
      await follows.save();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.myProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("posts");
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("posts");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({ success: false, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }
    const resetPasswordToken = user.getResetPasswordToken();
    await user.save();
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/password/reset/${resetPasswordToken}`;
    const message = `Reset Your Pssword by clicking on the link below :\n\n${resetUrl}`;
    try {
      await sendEmail({
        email: user.email,
        subject: "Reset Password",
        message,
      });
      res
        .status(200)
        .json({ success: true, message: `Email sent to ${user.email}` });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      res.status(500).json({ success: false, message: error.message });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Token is invalid or expired" });
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(200).json({ success: true, message: "password updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
module.exports = { register, login };
