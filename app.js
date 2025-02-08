const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const postRoutes = require("./backend/routes/postRoutes"); // Ensure this file exists!
const scraperRoutes = require("./backend/routes/scraper");



const app = express();
app.use(express.json()); // Middleware to parse JSON requests
app.use(cors()); // Allow cross-origin requests

// Main API Route
app.use("/api/posts", postRoutes); 
app.use("/api", scraperRoutes);

// Default Route (Test Purpose)
app.get("/", (req, res) => {
    res.send("✅ API is Live!");
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.error("❌ MongoDB Connection Failed:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
