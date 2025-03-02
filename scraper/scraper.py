import requests
import json
import random
import time
import os
import sys

# Ensure UTF-8 encoding to prevent Unicode errors
sys.stdout.reconfigure(encoding='utf-8')

# Load API Key and subreddit from environment variables
SCRAPER_API_KEY = os.getenv("SCRAPER_API_KEY", "6eb17876e00d1b856bd34f49a0a8a15c")  # Ensure this is set in .env
SUBREDDIT = os.getenv("SUBREDDIT", "technology")  # Default to 'technology'

# Construct ScraperAPI URL with &render=true for better scraping
SCRAPER_URL = f"https://api.scraperapi.com?api_key={SCRAPER_API_KEY}&url=https://www.reddit.com/r/{SUBREDDIT}/hot.json&render=true"

# Rotating User-Agent list
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:88.0) Gecko/20100101 Firefox/88.0"
]

HEADERS = {
    "User-Agent": random.choice(USER_AGENTS),
    "Accept": "application/json",
    "Accept-Language": "en-US,en;q=0.9",
    "Connection": "keep-alive",
    "Referer": "https://www.reddit.com",
    "Origin": "https://www.reddit.com",
    "Sec-Fetch-Site": "same-origin"
}

def fetch_reddit_posts(retries=3):
    """Scrape hot posts from Reddit using ScraperAPI with retries and error handling."""
    errors = []  # Store errors for better debugging

    for attempt in range(retries):
        try:
            response = requests.get(SCRAPER_URL, headers=HEADERS, timeout=30)

            if response.status_code == 401:
                errors.append("❌ Unauthorized request: Check API key and access permissions.")
                return {"error": errors}

            if response.status_code != 200:
                errors.append(f"❌ Failed to fetch data (Attempt {attempt + 1}): {response.status_code}")
                time.sleep(5)
                continue

            try:
                data = response.json()
            except json.JSONDecodeError:
                errors.append(f"⚠️ JSON Parsing Error (Attempt {attempt + 1}): Invalid response.")
                time.sleep(5)
                continue

            if "data" not in data:
                errors.append(f"⚠️ Unexpected response format (Attempt {attempt + 1})")
                time.sleep(5)
                continue

            posts = data["data"].get("children", [])
            extracted_posts = [
                {
                    "title": post["data"]["title"],
                    "score": post["data"]["score"],
                    "author": post["data"]["author"],
                    "url": post["data"]["url"],
                    "num_comments": post["data"]["num_comments"],
                    "created_utc": post["data"]["created_utc"],
                    "subreddit": SUBREDDIT
                }
                for post in posts
            ]

            return {"scraped_posts": extracted_posts}  # ✅ Always return a valid JSON object

        except requests.exceptions.Timeout:
            errors.append(f"⏳ Request timed out (Attempt {attempt + 1})")
            time.sleep(5)

        except requests.exceptions.RequestException as e:
            errors.append(f"❌ ScraperAPI request failed (Attempt {attempt + 1}): {str(e)}")
            time.sleep(5)

    return {"error": errors}  # ✅ Ensure valid JSON response even on failure

if __name__ == "__main__":
    try:
        result = fetch_reddit_posts()

        print(json.dumps(result, indent=4, ensure_ascii=False))  # ✅ Always a single valid JSON output

    except Exception as e:
        print(json.dumps({"error": f"❌ Critical Error in scraper: {str(e)}"}))
