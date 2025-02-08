const express = require("express");
const {
  getAllPosts,
  getPostById,
  getTopPosts,
  getRecentPosts,
  getPopularAuthors,
  getTrendingSubreddits,
  getPostActivity
} = require("../controllers/postController");

const router = express.Router();

// 🔹 Defined **string-based routes** first (to avoid misinterpretation as IDs)
router.get("/top", getTopPosts);
router.get("/recent", getRecentPosts);
router.get("/popular-authors", getPopularAuthors);
router.get("/trends", getTrendingSubreddits);
router.get("/activity", getPostActivity);

// 🔹 Get all posts
router.get("/", getAllPosts);

// 🔹 Get a single post by ID (should come **after** string-based routes)
router.get("/:id", getPostById);

module.exports = router;
