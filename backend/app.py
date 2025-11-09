# .envファイルは使用しませんが、環境依存のライブラリのロード処理として残します
from dotenv import load_dotenv
import os
import json
import requests
from flask import Flask, jsonify
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
# フロントエンド（http://localhost:5173）からのアクセスを許可
CORS(app, resources={r"/api/*": {"origins": os.getenv("FRONTEND_ORIGIN")}})

# Google Apps ScriptのWebアプリURLを設定
GAS_API_URL = os.getenv("GAS_API_URL")

def fetch_sheets_data():
    """
    GAS Web APIからデータを取得し、thumbnail を含めたリストを返す
    """
    if not GAS_API_URL or "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE" in GAS_API_URL:
        print("Error: GAS_API_URL is not configured.")
        return None

    try:
        response = requests.get(GAS_API_URL, timeout=10)
        response.raise_for_status()
        try:
            data = response.json()
        except json.JSONDecodeError:
            print("Error: Cannot decode JSON from GAS response")
            print("Raw response:", response.text)
            return None

        videos = []
        for row in data:
            # row が dict を返す前提（GAS側でヘッダをキーにしている想定）
            title = (row.get("title") or "").strip()
            driveLink = (row.get("driveLink") or "").strip()
            thumbnail = (row.get("thumbnail") or "").strip() or None
            videos.append({
                "title": title,
                "summary": row.get("summary", ""),
                "category": row.get("category", ""),
                "url": row.get("url", ""),
                "driveLink": driveLink,
                "thumbnail": thumbnail,
                "description": row.get("description", "")
            })
        return videos

    except requests.exceptions.RequestException as e:
        print("RequestException:", e)
        return None
    except Exception as e:
        print("Unexpected error:", e)
        return None


@app.route("/api/videos", methods=["GET"])
def get_videos():
    videos = fetch_sheets_data()
    if videos is None:
        return jsonify({"error": "Failed to fetch videos"}), 500
    return jsonify(videos), 200


@app.route("/", methods=["GET"])
def index():
    return "E-FLIX backend running", 200


if __name__ == "__main__":
    print("Starting Flask server on http://127.0.0.1:5000")
    # 開発モードで実行
    app.run(debug=True)
