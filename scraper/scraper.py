import requests
import pymongo
import time
import json
import os
from datetime import datetime, timezone
from dotenv import load_dotenv  # Import dotenv

# Load environment variables from .env file
load_dotenv()

# MongoDB Configuration (Load from .env)
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("DB_NAME", "redditTracker")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "redditPosts")

# Define the subreddit to scrape
SUBREDDIT = os.getenv("SUBREDDIT", "technology")
URL = f"https://www.reddit.com/r/{SUBREDDIT}/hot.json"

# Headers to mimic a browser request
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36"
}

def fetch_reddit_posts():
    """Scrape hot posts from a subreddit without API keys."""
    response = requests.get(URL, headers=HEADERS)

    if response.status_code != 200:
        print(f"❌ Failed to fetch data: {response.status_code}")
        return []

    data = response.json()
    posts = data.get("data", {}).get("children", [])

    # Extract relevant post details
    extracted_posts = []
    for post in posts:
        post_data = post["data"]
        extracted_posts.append({
            "title": post_data["title"],
            "score": post_data["score"],
            "author": post_data["author"],
            "url": post_data["url"],
            "num_comments": post_data["num_comments"],
            "created_utc": datetime.fromtimestamp(post_data["created_utc"], timezone.utc).isoformat(),  # FIXED
            "subreddit": SUBREDDIT
        })

    return extracted_posts

def save_to_mongodb(posts):
    """Save posts to MongoDB and return both new and existing data."""
    if not posts:
        print("⚠️ No posts fetched.")
        return []

    client = pymongo.MongoClient(MONGO_URI)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]

    saved_posts = []
    for post in posts:
        existing_post = collection.find_one({"url": post["url"]})
        if existing_post:
            post["_id"] = str(existing_post["_id"])  # Convert ObjectId to string
        else:
            inserted = collection.insert_one(post)
            post["_id"] = str(inserted.inserted_id)
        saved_posts.append(post)

    client.close()
    return saved_posts


if __name__ == "__main__":
    posts = fetch_reddit_posts()
    saved_posts = save_to_mongodb(posts)

    # Convert ObjectId to string before returning JSON response
    print(json.dumps({"scraped_posts": saved_posts}, default=str))  # FIXED
