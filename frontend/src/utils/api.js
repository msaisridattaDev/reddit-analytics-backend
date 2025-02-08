// src/utils/api.js
const BASE_URL = "http://localhost:5000/api/posts";

export const getAllPosts = async () => {
  const res = await fetch(`${BASE_URL}/`);
  return res.json();
};

export const getPostById = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`);
  return res.json();
};

export const getTrendingPosts = async () => {
  const res = await fetch(`${BASE_URL}/top`);
  return res.json();
};

export const getPostActivity = async () => {
  const res = await fetch(`${BASE_URL}/activity`);
  return res.json();
};

export const getTrendingSubreddits = async () => {
  const res = await fetch(`${BASE_URL}/trends`);
  return res.json();
};
