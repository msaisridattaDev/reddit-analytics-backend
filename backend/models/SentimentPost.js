/*
const mongoose = require("mongoose");

const sentimentPostSchema = new mongoose.Schema({
  title: String,
  url: String,
  author: String,
  created_utc: Number,
  num_comments: Number,
  score: Number,
  subreddit: String,
  sentiment_score: Number,  // New field for sentiment
  keywords: [String],       // Placeholder for Phase 2 (TF-IDF)
  hype_score: Number        // Placeholder for Phase 3 (Hype Detection)
});

// Ensure the correct collection name:
module.exports = mongoose.model("SentimentPost", sentimentPostSchema, "sentimentPosts");

*/


const mongoose = require("mongoose");

const sentimentPostSchema = new mongoose.Schema({
  title: String,
  url: String,
  author: String,
  created_utc: Number,
  num_comments: Number,
  score: Number,
  subreddit: String,
  sentiment: String,
  sentimentScore: Number,
  keywords: [String],
  hype_score: Number // ✅ Ensure this exists!
});

module.exports = mongoose.model("SentimentPost", sentimentPostSchema, "sentimentposts");

