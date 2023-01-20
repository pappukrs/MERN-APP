const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { reset } = require("nodemon");

const secretKey = process.env.secretKey || "sabkabaapsecretkey";
const userSchema = mongoose.Schema({
  name: { type: String, required: [true, "Please Enter a name"] },
  avatar: { public_id: String, url: String },
  email: {
    type: String,
    required: [true, "Please Enter email"],
    unique: [true, "Email alrady exist"],
  },
  password: {
    type: String,
    required: [true, "Please Enter password"],
    minLength: [6, "Password must be at least 6 characters"],
    select: false,
  },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  followers: [{ type: mongoose.Schema.Types.objectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.objectId, ref: "User" }],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});
// userSchema.pre("save", async (next) => {
//   if (this.isModified("password")) {
//     this.password = await bcrypt.hash(this.password, 10);
//   }
//   next();
// });

userSchema.pre("save", async function (next) {
  // Only run this function if password was moddified (not on other update functions)
  if (!this.isModified("password")) return next();
  // Hash password with strength of 12
  this.password = await bcrypt.hash(this.password, 12);
  //remove the confirm field
  // this.passwordConfirm = undefined;
});

// userSchema.methods.matchPassword = async function (password) {
//   console.log(password, this.password);
//   return await bcrypt.compare(password, this.password);
// };

userSchema.method({
  async passwordMatches(password) {
    console.log(password, this.password);
    return bcrypt.compare(password, this.password);
  },
});

userSchema.methods.generateToken = async function () {
  return jwt.sign({ _id: this._id }, secretKey);
};
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(90).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
const UserModel = mongoose.model("user", userSchema);
module.exports = UserModel;
