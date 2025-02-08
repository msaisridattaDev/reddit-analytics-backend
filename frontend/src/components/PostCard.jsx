// src/components/PostCard.jsx - Post Card UI
import React from "react";
//import "./PostCard.css";

const PostCard = ({ post }) => {
  return (
    <div className="post-card">
      <h3>{post.title}</h3>
      <p>📝 Author: {post.author}</p>
      <p>💬 Comments: {post.num_comments}</p>
      <p>🔥 Score: {post.score}</p>
    </div>
  );
};

export default PostCard;
