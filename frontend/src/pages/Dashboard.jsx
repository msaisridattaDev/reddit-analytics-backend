import React, { useState, useEffect } from "react";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [scrapedData, setScrapedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [topPosts, setTopPosts] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [popularAuthors, setPopularAuthors] = useState([]);
  const [trendingSubreddits, setTrendingSubreddits] = useState([]);

  // Fetch all additional analytics data when component mounts
  useEffect(() => {
    async function fetchData() {
      try {
        const responses = await Promise.all([
          fetch("http://localhost:5000/api/posts/top"),
          fetch("http://localhost:5000/api/posts/recent"),
          fetch("http://localhost:5000/api/posts/popular-authors"),
          fetch("http://localhost:5000/api/posts/trends"),
        ]);

        // Ensure responses are valid before parsing
        const jsonData = await Promise.all(
          responses.map(async (res) => {
            if (!res.ok) throw new Error(`Failed to fetch ${res.url}`);
            return res.json();
          })
        );

        const [top, recent, authors, trends] = jsonData;
        setTopPosts(top);
        setRecentPosts(recent);
        setPopularAuthors(authors);
        setTrendingSubreddits(trends);
      } catch (error) {
        console.error("❌ Failed to fetch analytics data:", error);
      }
    }

    fetchData();
  }, []);

  // Fixed Scraping API Call (GET instead of POST)
  const handleScrape = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/scrape");

      if (!response.ok) {
        throw new Error("Scraping request failed");
      }

      const result = await response.json();
      console.log("✅ API Response:", result);

      if (result.success && result.data.scraped_posts.length > 0) {
        setScrapedData(result.data.scraped_posts);
      } else {
        setScrapedData([]);
        console.warn("⚠️ No new data received!");
      }
    } catch (error) {
      console.error("❌ Scraping failed:", error.message);
      alert("Scraping failed! Please check backend logs.");
    }
    setLoading(false);
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">🔥 Reddit Analytics Dashboard</h1>

      {/* Scraper Button */}
      <div className="scrape-section">
        <button onClick={handleScrape} disabled={loading} className="scrape-button">
          {loading ? "⏳ Scraping..." : "🚀 Trigger Scraper"}
        </button>
      </div>

      {/* Scraped Data */}
      <div className="dashboard-box">
        <h2>📌 Scraped Posts</h2>
        {scrapedData.length > 0 ? (
          <ul className="post-list">
            {scrapedData.map((post, index) => (
              <li key={post._id || index} className="post-item">
                <a href={post.url} target="_blank" rel="noopener noreferrer" className="post-link">
                  {post.title} - <span className="post-author">{post.author}</span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-data">No new data scraped.</p>
        )}
      </div>

      {/* Top Trending Posts */}
      <div className="dashboard-box">
        <h2>🔥 Top Trending Posts</h2>
        <ul className="data-list">
          {topPosts.length > 0 ? (
            topPosts.map((post, index) => <li key={post._id || index}>{post.title}</li>)
          ) : (
            <p>No trending posts available.</p>
          )}
        </ul>
      </div>

      {/* Most Recent Posts */}
      <div className="dashboard-box">
        <h2>🆕 Most Recent Posts</h2>
        <ul className="data-list">
          {recentPosts.length > 0 ? (
            recentPosts.map((post, index) => <li key={post._id || index}>{post.title}</li>)
          ) : (
            <p>No recent posts available.</p>
          )}
        </ul>
      </div>

      {/* Popular Authors */}
      <div className="dashboard-box">
        <h2>💡 Popular Authors</h2>
        <ul className="data-list">
          {popularAuthors.length > 0 ? (
            popularAuthors.map((author, index) => (
              <li key={index}>{author._id} (Posts: {author.postCount})</li>
            ))
          ) : (
            <p>No authors available.</p>
          )}
        </ul>
      </div>

      {/* Trending Subreddits */}
      <div className="dashboard-box">
        <h2>📢 Trending Subreddits</h2>
        <ul className="data-list">
          {trendingSubreddits.length > 0 ? (
            trendingSubreddits.map((subreddit, index) => <li key={index}>{subreddit._id}</li>)
          ) : (
            <p>No trending subreddits available.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
