import requests
import pymongo
import json
import os
from datetime import datetime, timezone
from dotenv import load_dotenv

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
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36",
    "Accept": "application/json",
    "Referer": "https://www.reddit.com",
}

def fetch_reddit_posts():
    """Fetch hot posts from a subreddit."""
    try:
        response = requests.get(URL, headers=HEADERS)

        if response.status_code != 200:
            return {"error": f"HTTP Error: {response.status_code}", "posts": []}

        data = response.json()
        posts = data.get("data", {}).get("children", [])

        extracted_posts = [
            {
                "title": post["data"]["title"],
                "score": post["data"]["score"],
                "author": post["data"]["author"],
                "url": post["data"]["url"],
                "num_comments": post["data"]["num_comments"],
                "created_utc": datetime.fromtimestamp(post["data"]["created_utc"], timezone.utc).isoformat(),
                "subreddit": SUBREDDIT,
            }
            for post in posts
        ]

        return {"posts": extracted_posts}

    except Exception as e:
        return {"error": str(e), "posts": []}

def save_to_mongodb(posts):
    """Save posts to MongoDB and return the inserted documents."""
    if not posts:
        return {"error": "No posts fetched.", "saved_posts": []}

    try:
        client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
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
        return {"saved_posts": saved_posts}

    except Exception as e:
        return {"error": f"MongoDB Connection Failed: {str(e)}", "saved_posts": []}

if __name__ == "__main__":
    try:
        result = fetch_reddit_posts()

        if "error" in result:
            print(json.dumps(result))  # Log errors in JSON format
        else:
            saved_result = save_to_mongodb(result["posts"])
            print(json.dumps(saved_result))  # Ensure JSON output

    except Exception as e:
        print(json.dumps({"error": str(e)}))  # Ensure JSON output even on failure
