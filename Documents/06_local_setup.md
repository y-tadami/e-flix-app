# ローカル開発環境の構築手順

このドキュメントでは、E-FLIXをローカルPC上で動かすまでの手順を説明します。

---

## 前提条件

以下がインストール済みであること：
- Node.js（v18以上推奨）
- Python（v3.10以上推奨）
- Git

---

## 手順

### Step 1: リポジトリをクローン

```bash
git clone https://github.com/y-tadami/e-flix-app.git
cd e-flix-app
```

---

### Step 2: フロントエンドの環境変数を設定

`frontend/.env` ファイルを作成し、以下を記入します：

```
VITE_FIREBASE_API_KEY="（Firebaseコンソールから取得）"
VITE_FIREBASE_AUTH_DOMAIN="netflix-clone-course-39cf8.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="netflix-clone-course-39cf8"
VITE_FIREBASE_STORAGE_BUCKET="netflix-clone-course-39cf8.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="（Firebaseコンソールから取得）"
VITE_FIREBASE_APP_ID="（Firebaseコンソールから取得）"
VITE_ALLOWED_DOMAIN="@estyle-inc.jp"
VITE_API_URL="http://127.0.0.1:5000/api/videos"
```

> Firebase の値は [Firebase Console](https://console.firebase.google.com) → プロジェクト設定 → アプリ で確認できます。

---

### Step 3: フロントエンドの依存パッケージをインストール

```bash
cd frontend
npm install
```

---

### Step 4: バックエンドの環境変数を設定

`backend/.env` ファイルを作成し、以下を記入します：

```
GAS_API_URL="（Google Apps ScriptのWebアプリURL）"
FRONTEND_ORIGIN=http://localhost:5173
FLASK_DEBUG=true
```

---

### Step 5: バックエンドの仮想環境を作成してパッケージをインストール

```bash
cd backend
python3 -m venv venv
source venv/bin/activate       # Windowsの場合: venv\Scripts\activate
pip install -r requirements.txt
```

---

### Step 6: サーバーを起動（2つのターミナルが必要）

**ターミナル①：フロントエンド起動**
```bash
cd frontend
npm run dev
```

**ターミナル②：バックエンド起動**
```bash
cd backend
source venv/bin/activate
python app.py
```

---

### Step 7: ブラウザで確認

`http://localhost:5173` にアクセスしてください。

---

## よくあるトラブル

| 症状 | 原因 | 対処 |
|------|------|------|
| 「講義動画の取得に失敗しました」 | バックエンドが起動していない | Step 6 のターミナル②を確認 |
| CORSエラーが出る | `FRONTEND_ORIGIN` が違う | `backend/.env` を `http://localhost:5173` に設定 |
| Firebaseログインができない | ドメインが未登録 | Firebase Console → Authentication → 承認済みドメインに `localhost` を追加 |
| `ModuleNotFoundError: flask` | 仮想環境が有効でない | `source venv/bin/activate` を実行してから `python app.py` |
