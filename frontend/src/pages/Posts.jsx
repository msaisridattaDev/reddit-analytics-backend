import React, { useEffect, useState } from "react";
import { getAllPosts } from "../utils/api";
import Loader from "../components/Loader";
import Select from "react-select";
import "../styles/Posts.css"; // Updated styling applied

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [subreddits, setSubreddits] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [selectedSubreddit, setSelectedSubreddit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllPosts().then((data) => {
      setPosts(data);
      setFilteredPosts(data);
      setAuthors([...new Set(data.map((p) => p.author))]);
      setSubreddits([...new Set(data.map((p) => p.subreddit))]);
      setLoading(false);
    });
  }, []);

  const handleFilter = () => {
    let filtered = posts;
    if (selectedAuthor) filtered = filtered.filter((p) => p.author === selectedAuthor.value);
    if (selectedSubreddit) filtered = filtered.filter((p) => p.subreddit === selectedSubreddit.value);
    setFilteredPosts(filtered);
  };

  const clearFilters = () => {
    setSelectedAuthor(null);
    setSelectedSubreddit(null);
    setFilteredPosts(posts);
  };

  return (
    <div className="posts-container">
      <h2 className="posts-header">📌 All Posts</h2>

      {/* Filters */}
      <div className="filters">
        <Select
          options={authors.map(a => ({ value: a, label: a }))}
          onChange={setSelectedAuthor}
          placeholder="Filter by Author"
          className="select-dropdown"
        />
        <Select
          options={subreddits.map(s => ({ value: s, label: s }))}
          onChange={setSelectedSubreddit}
          placeholder="Filter by Subreddit"
          className="select-dropdown"
        />
        <button className="filter-button" onClick={handleFilter}>Apply Filter</button>
        <button className="clear-button" onClick={clearFilters}>Clear Filters</button>
      </div>

      {/* Loader */}
      {loading ? (
        <Loader />
      ) : (
        <div className="posts-list">
          {filteredPosts.map((post) => (
            <div key={post.id} className="post-card">
              <a href={post.url} target="_blank" rel="noopener noreferrer" className="post-title">
                {post.title}
              </a>
              <div className="post-meta">
                <span className="post-author">👤 {post.author}</span>
                <span className="post-comments">💬 {post.num_comments} Comments</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Posts;
