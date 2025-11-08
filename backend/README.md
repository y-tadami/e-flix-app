# E-FLIX Backend

E-FLIXのバックエンド（Flask）プロジェクトです。  
Google Apps Script（GAS）経由で講義動画データを取得し、フロントエンドにAPIとして提供します。

## 主な機能

- Google Apps Script Web APIから講義動画データを取得
- `/api/videos` エンドポイントで動画リストを返却
- CORS対応（フロントエンドからのアクセス許可）

## セットアップ手順

1. リポジトリをクローン

    ```bash
    git clone <このリポジトリのURL>
    cd e-flix-backend
    ```

2. 必要なパッケージをインストール

    ```bash
    pip install flask flask-cors python-dotenv requests
    ```

3. `.env` ファイルを作成し、以下の内容を設定

    ```env
    GAS_API_URL="https://script.google.com/macros/s/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/exec"
    FRONTEND_ORIGIN=https://e-flix-frontend.vercel.app
    ```

4. サーバーを起動

    ```bash
    python app.py
    ```

## エンドポイント

- `GET /api/videos`  
  GAS経由で取得した講義動画リストを返します。

## 注意事項

- `.env`ファイルはGit管理対象外です。
- 本番デプロイ時はCORSの許可ドメイン（`FRONTEND_ORIGIN`）を適切に設定してください。

---

## ライセンス

社内利用限定