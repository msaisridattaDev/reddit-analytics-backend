
import os
import requests
import json
import random
from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables
load_dotenv()

# MongoDB Config
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")

# ScraperAPI Config
SCRAPER_API_KEY = os.getenv("SCRAPER_API_KEY")
SUBREDDIT = os.getenv("SUBREDDIT")
SCRAPER_URL = f"https://api.scraperapi.com?api_key={SCRAPER_API_KEY}&url=https://www.reddit.com/r/{SUBREDDIT}/hot.json"

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
    "Connection": "keep-alive"
}

def fetch_reddit_posts():
    """Scrape hot posts from Reddit using ScraperAPI."""
    try:
        response = requests.get(SCRAPER_URL, headers=HEADERS, timeout=10)

        if response.status_code != 200:
            print(f"❌ Failed to fetch data: {response.status_code}")
            return []

        data = response.json()
        posts = data.get("data", {}).get("children", [])

        extracted_posts = []
        for post in posts:
            post_data = post["data"]
            extracted_posts.append({
                "title": post_data["title"],
                "score": post_data["score"],
                "author": post_data["author"],
                "url": post_data["url"],
                "num_comments": post_data["num_comments"],
                "created_utc": post_data["created_utc"],
                "subreddit": SUBREDDIT
            })

        return extracted_posts

    except requests.exceptions.RequestException as e:
        print(f"❌ ScraperAPI request failed: {e}")
        return []

def save_to_mongo(posts):
    """Save scraped posts to MongoDB."""
    try:
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]

        if not posts:
            print("⚠️ No posts to save.")
            return

        collection.insert_many(posts)
        print("✅ Data saved to MongoDB.")

    except Exception as e:
        print(f"❌ MongoDB Error: {e}")

if __name__ == "__main__":
    posts = fetch_reddit_posts()

    if posts:
        print(json.dumps({"scraped_posts": posts}, indent=4))
        save_to_mongo(posts)
    else:
        print("⚠️ No posts fetched.")
