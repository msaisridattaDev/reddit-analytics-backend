const Sentiment = require("vader-sentiment");
const natural = require("natural");
const RedditPost = require("../models/RedditPost");
const SentimentPost = require("../models/SentimentPost");

// 🚀 **Process All Three Phases in One Call**
const processAll = async (req, res) => {
    try {
        // 1️⃣ Fetch Latest Reddit Posts
        const posts = await RedditPost.find({});
        if (!posts.length) return res.status(404).json({ message: "No posts found" });

        console.log(`✅ Fetched ${posts.length} posts`);

        // 2️⃣ Sentiment Analysis
        const processedPosts = posts.map((post) => {
            const analysis = Sentiment.SentimentIntensityAnalyzer.polarity_scores(post.title || "");
            let sentimentScore = analysis.compound;
            let sentimentLabel =
                sentimentScore >= 0.05 ? "positive" :
                sentimentScore <= -0.05 ? "negative" : "neutral";

            return {
                ...post.toObject(),
                sentiment: sentimentLabel,
                sentimentScore,
                keywords: [],
                hype_score: null
            };
        });

        // 3️⃣ Keyword Extraction via TF-IDF
        console.log("🔍 Extracting keywords using TF-IDF...");
        const tfidf = new natural.TfIdf();
        processedPosts.forEach((post) => {
            if (post.title) tfidf.addDocument(post.title);
        });

        processedPosts.forEach((post, index) => {
            const terms = tfidf.listTerms(index).slice(0, 5);
            post.keywords = terms.map(item => item.term);
        });

        console.log("✅ Keyword extraction completed!");

        // 4️⃣ Hype Score Calculation
        console.log("🔥 Calculating Hype Score...");
        processedPosts.forEach((post) => {
            let controversyFactor = post.num_comments / Math.max(post.score, 1);
            post.hype_score = (controversyFactor + Math.abs(post.sentimentScore)) * 10;
        });

        console.log("✅ Hype Score processing completed!");

        // 5️⃣ Store Processed Data in `SentimentPost`
        await SentimentPost.deleteMany({});
        await SentimentPost.insertMany(processedPosts);
        console.log("✅ Inserted processed posts into SentimentPost");

        // 6️⃣ Return Final Processed Data
        const finalPosts = await SentimentPost.find();
        res.json(finalPosts);
    } catch (error) {
        console.error("❌ Error processing data:", error);
        res.status(500).json({ message: "❌ Internal Server Error" });
    }
};

module.exports = { processAll };
