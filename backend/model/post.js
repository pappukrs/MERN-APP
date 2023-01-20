const mongoose = require("mongoose");
const postSchema = mongoose.Schema({
  caption: String,
  imageUrl: {
    public_id: String,
    url: String,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  likes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      comment: { type: String, required: true },
    },
  ],
});

const PostModel = mongoose.model("Post", postSchema);
module.exports = PostModel;
