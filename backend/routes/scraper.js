const express = require("express");
const { spawn } = require("child_process");
const router = express.Router();

// API to trigger scraper
router.get("/scrape", async (req, res) => {
    try {
      const pythonProcess = spawn("python", ["scraper/scraper.py"]);
      let dataChunks = "";
  
      pythonProcess.stdout.on("data", (data) => {
        dataChunks += data.toString();
      });
  
      pythonProcess.stderr.on("data", (data) => {
        console.error(`❌ Scraper Error: ${data}`);
      });
  
      pythonProcess.on("close", (code) => {
        console.log("🟢 Scraper Process Exited with Code:", code);
        console.log("🔹 Raw Data from Python:", dataChunks);
  
        try {
          const parsedData = JSON.parse(dataChunks);
          console.log("✅ Parsed Data to Send:", parsedData);
          res.json({ message: "Scraping Completed", success: true, data: parsedData });
        } catch (error) {
          console.error("❌ JSON Parsing Error:", error);
          res.status(500).json({ message: "Error parsing scraper output" });
        }
      });
  
    } catch (error) {
      console.error("❌ Error triggering scraper:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  

module.exports = router;
