# e-flix-app

E-FLIXは、社内向けの講義動画プラットフォームです。  
このリポジトリはフロントエンド（frontend）とバックエンド（backend）を1つにまとめた構成です。

---

## 各ディレクトリの説明
### frontend/
* React（Vite）+ Tailwind CSSで構築
* Google認証（Firebase Auth）による社内限定ログイン
* 講義動画の一覧・検索・カテゴリ・マイリスト・履歴機能
* サムネイル画像はFirebase StorageのURLを利用
* 視聴期限の表示機能

### backend/
* Python FlaskでAPIサーバーを構築
* Googleスプレッドシートから講義データを取得しAPIで提供
* CORS対応
* Renderでデプロイ

### functions/
* Google Cloud Functions（Node.js）でログ自動出力機能を構築
* Firestoreの視聴ログを定期的に取得し、CSVファイルとしてGoogle Driveに保存
* Cloud Scheduler（Pub/Sub）で定期実行（例：10分ごと、毎月1日9:00など）
* ログCSVは日本時間で出力、最新日時が下に並ぶように整形

---

## システム構成

- **フロントエンド（Vercel）**  
  ユーザーが動画を視聴・操作。Firebase認証で社内限定アクセス。

- **バックエンド（Render）**  
  Googleスプレッドシートから動画メタデータを取得しAPIで提供。  
  フロントエンドからAPI経由で動画情報を取得。

- **ログ自動出力（Google Cloud Functions）**  
  Firestoreに保存された視聴ログを定期的に取得し、CSV形式でGoogle Driveに保存。  
  Cloud Schedulerで自動実行。  
  保存先フォルダはサービスアカウントに編集権限を付与。

---

## デプロイ・運用
* フロントエンド：VercelでfrontendディレクトリをRoot Directoryに指定してデプロイ
* バックエンド：RenderでbackendディレクトリをRoot Directoryに指定してデプロイ
* Cloud Functions：gcloud CLIでfunctionsディレクトリをデプロイし、Cloud Schedulerで定期実行

---

## 環境変数・設定
* フロントエンド、バックエンドともに.envファイルでAPIキーやURLを管理
* Vercel/Renderの「Environment Variables」にも同じ値を設定
* Cloud FunctionsはサービスアカウントJSONを.gitignoreで管理

---

## 注意事項
* サインインには@estyle-inc.jpのGoogleアカウントが必要です
* サムネイル画像はFirebase Storage推奨（Google DriveはCORS制限あり）
* バックエンドAPIやスプレッドシートの仕様変更時はREADMEも更新してください
* サービスアカウントキーや認証情報はGitHubにpushしないこと

---

## ライセンス
社内利用限定


# 開発・運用を他のメンバーでもできるようにするための作業・設定

## 1. フロントエンド（frontend）

- **環境構築手順をREADMEに記載**  
  - 必要なNode.jsバージョン、npm/yarnのインストール方法
  - `npm install` で依存パッケージをインストール
  - `.env.example` を用意し、必要な環境変数（APIエンドポイント、Firebase設定など）を記載
- **Vercelの管理権限を共有**  
  - Vercelプロジェクトに他メンバーを招待
  - デプロイ方法（GitHub連携 or Vercel CLI）を共有

## 2. バックエンド（backend）

- **Python環境・依存パッケージの管理**  
  - `requirements.txt` を用意し、`pip install -r requirements.txt` でセットアップできるようにする
  - `.env.example` を用意し、APIキーやGASのURLなどを記載
- **Render（または他サーバー）の管理権限を共有**  
  - Renderプロジェクトに他メンバーを招待
  - デプロイ手順（GitHub連携 or CLI）をREADMEに記載

## 3. ログ自動取得機能（functions）

- **Google Cloudプロジェクトの権限共有**  
  - Cloud Functionsの管理権限を他メンバーに付与
  - サービスアカウントキーの管理方法を共有（GitHubにはpushしない）
  - デプロイ手順（gcloud CLIコマンドなど）をREADMEに記載
- **Cloud SchedulerやDriveの設定方法をドキュメント化**

## 4. 動画メタデータ（Googleスプレッドシート）

- **スプレッドシートの編集権限を共有**  
  - Googleスプレッドシートの共有設定で編集者を追加
  - シートの構成・列名・運用ルールをREADMEや別ドキュメントに記載

## 5. その他

- **GitHubリポジトリの管理権限を共有**
  - コラボレーターとして追加
  - 運用ルール（ブランチ運用、コミットメッセージ、PRレビューなど）を明記
- **READMEやWikiに全体の構成・運用手順・トラブルシュートを記載**
- **環境変数やAPIキーの管理方法（.envファイル、Vercel/Renderの環境変数設定）を明記**

---

**これらを整備・共有することで、他のメンバーでも開発・運用が可能になります。**