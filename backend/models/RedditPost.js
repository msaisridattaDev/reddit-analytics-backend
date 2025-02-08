const mongoose = require("mongoose");

const redditPostSchema = new mongoose.Schema({
  title: String,
  url: String,
  author: String,
  created_utc: Number,
  num_comments: Number,
  score: Number,
  subreddit: String
});

// **Ensure MongoDB is using the correct collection name:**
module.exports = mongoose.model("RedditPost", redditPostSchema, "redditPosts");
