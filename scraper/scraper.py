import requests
import json
import random
import time
import os
import sys

# Ensure UTF-8 encoding to prevent Unicode errors
sys.stdout.reconfigure(encoding='utf-8')

# Load API Key and subreddit from environment variables
SCRAPER_API_KEY = os.getenv("SCRAPER_API_KEY", "8de8a1d3256c1c88ffff4f70ccf04e5a")  # Ensure this is set in .env
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
    for attempt in range(retries):
        try:
            response = requests.get(SCRAPER_URL, headers=HEADERS, timeout=30)

            if response.status_code == 401:
                print("❌ Unauthorized request: Check your API key and access permissions.")
                return []

            if response.status_code != 200:
                print(f"❌ Failed to fetch data (Attempt {attempt + 1}): {response.status_code} - {response.text}")
                time.sleep(5)  # Wait before retrying
                continue

            try:
                data = response.json()
            except json.JSONDecodeError:
                print(f"⚠️ JSON Parsing Error (Attempt {attempt + 1}): Response is not valid JSON.")
                time.sleep(5)
                continue

            if "data" not in data:
                print(f"⚠️ Unexpected response format (Attempt {attempt + 1}), retrying...")
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
            return extracted_posts

        except requests.exceptions.Timeout:
            print(f"⏳ Request timed out (Attempt {attempt + 1}), retrying...")
            time.sleep(5)

        except requests.exceptions.RequestException as e:
            print(f"❌ ScraperAPI request failed (Attempt {attempt + 1}): {e}")
            time.sleep(5)

    print("⚠️ Scraping failed after multiple attempts.")
    return []

if __name__ == "__main__":
    posts = fetch_reddit_posts()

    if posts:
        print(json.dumps({"scraped_posts": posts}, indent=4, ensure_ascii=False))  # Ensure correct encoding
    else:
        print("⚠️ No posts fetched.")
