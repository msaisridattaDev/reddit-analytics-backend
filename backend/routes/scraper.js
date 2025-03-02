const express = require("express");
const { spawn } = require("child_process");
const router = express.Router();

router.get("/scrape", async (req, res) => {
    const pythonProcess = spawn("python", ["scraper/scraper.py"]);
    let dataChunks = [];

    pythonProcess.stdout.on("data", (data) => {
        dataChunks.push(data);
    });

    pythonProcess.stderr.on("data", (data) => {
        console.error(`Scraper stderr: ${data.toString()}`);
    });

    pythonProcess.on('close', (code) => {
        const output = Buffer.concat(dataChunks).toString().trim();
        try {
            const parsedData = JSON.parse(output);
            if (parsedData.error) {
                console.error("Error from Python script:", parsedData.error);
                res.status(500).json({ message: "Error from scraper", details: parsedData.error });
            } else {
                console.log("Parsed Data:", parsedData);
                res.json({ message: "Scraping Completed", success: true, data: parsedData });
            }
        } catch (error) {
            console.error("Failed to parse JSON:", error);
            res.status(500).json({ message: "Failed to parse output from scraper", error: error.message, raw_output: output });
        }
    });

    pythonProcess.on('error', (error) => {
        console.error("Error with Python script execution:", error);
        res.status(500).json({ message: "Python script execution failed", error: error.message });
    });
});

module.exports = router;
