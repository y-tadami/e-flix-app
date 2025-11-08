# app.py 解説ドキュメント

このファイルはE-FLIXアプリのバックエンドAPI（Flask）を構成します。  
主な役割は「動画データの提供（/api/videos）」です。

---

## 1. システム概要

- FlaskでAPIサーバーを構築
- `/api/videos`エンドポイントで動画データ（JSON）を返す
- 今はサンプルとして静的な動画リストを返す

---

## 2. コード構成

```python
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/videos')
def get_videos():
    # ここで動画データを返す
    return jsonify([
        {
            "id": "video1",
            "title": "2025年10月「機械学習エンジニアリング」",
            "summary": "第1回：モデルの用途と種類",
            "category": "ML",
            "driveLink": "https://drive.google.com/file/d/xxxx/preview",
            "thumbnail": "",
            "description": "詳細説明..."
        }
    ])

if __name__ == '__main__':
    app.run(debug=True)
```

---

## 3. 主な関数と役割

| 関数名      | 引数 | 主な処理内容                                 |
|-------------|------|----------------------------------------------|
| get_videos  | なし | 動画リスト（JSON形式）を返すAPIエンドポイント |

---

### 4. 開発・デバッグ情報

- ローカル開発環境URL: `http://127.0.0.1:5000`
- エンドポイント:
  - `GET /api/videos` : 動画リスト取得
- デバッグモード: 有効（`app.run(debug=True)`）