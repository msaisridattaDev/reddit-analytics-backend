const express = require("express");
const router = express.Router();
const { processAll } = require("../controllers/sentimentController");

// 🚀 Single API to Process & Fetch Sentiment, Keywords, and Hype Score
router.get("/get-sentiment-posts", processAll);

module.exports = router;
