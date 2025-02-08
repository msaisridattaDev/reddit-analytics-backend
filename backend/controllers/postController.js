const Post = require("../models/RedditPost");

// 1️⃣ Get All Posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ created_utc: -1 }).limit(20);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving posts", error });
  }
};

// 2️⃣ Get Single Post by ID
exports.getPostById = async (req, res) => {
    try {
      const { id } = req.params;
  
      // 🔹 Validate if ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid Post ID format" });
      }
  
      const post = await Post.findById(id);
  
      // 🔹 Check if post exists in DB
      if (!post) {
        return res.status(404).json({ message: "Post not found in database" });
      }
  
      res.json(post);
    } catch (error) {
      console.error("Error retrieving post:", error);
      res.status(500).json({ message: "Error retrieving post", error });
    }
  };

// 3️⃣ Get Top Trending Posts
exports.getTopPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ score: -1 }).limit(10);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving top posts", error });
  }
};

// 4️⃣ Get Recent Posts
exports.getRecentPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ created_utc: -1 }).limit(10);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving recent posts", error });
  }
};

// 5️⃣ Get Popular Authors
exports.getPopularAuthors = async (req, res) => {
  try {
    const authors = await Post.aggregate([
      { $group: { _id: "$author", totalScore: { $sum: "$score" }, postCount: { $sum: 1 } } },
      { $sort: { totalScore: -1 } },
      { $limit: 5 }
    ]);
    res.json(authors);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving popular authors", error });
  }
};

// 6️⃣ Get Trending Subreddits
exports.getTrendingSubreddits = async (req, res) => {
  try {
    const subreddits = await Post.aggregate([
      { $group: { _id: "$subreddit", postCount: { $sum: 1 } } },
      { $sort: { postCount: -1 } },
      { $limit: 5 }
    ]);
    res.json(subreddits);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving trending subreddits", error });
  }
};

// 7️⃣ Get Post Activity Over Time
exports.getPostActivity = async (req, res) => {
    try {
      const activity = await Post.aggregate([
        {
          $project: {
            title: 1,
            subreddit: 1,
            score: { $toInt: "$score" },  // 🔹 Ensure score is a number
            num_comments: { $toInt: "$num_comments" },  // 🔹 Ensure num_comments is a number
            activityIndex: { $multiply: [ { $toInt: "$score" }, { $toInt: "$num_comments" } ] }
          }
        },
        { $sort: { activityIndex: -1 } },
        { $limit: 10 }
      ]);
  
      res.json(activity);
    } catch (error) {
      console.error("Error retrieving post activity:", error);
      res.status(500).json({ message: "Error retrieving post activity", error });
    }
  };
  
