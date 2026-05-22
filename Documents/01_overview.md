# E-FLIX 全体概要・システム構成

社内講義動画プラットフォーム「E-FLIX」の全体像をまとめたドキュメントです。  
**まずこのファイルを読めば、アプリ全体の構造が把握できます。**

---

## アプリの概要

| 項目 | 内容 |
|------|------|
| 目的 | 社内の講義動画をNetflix風UIで視聴できるプラットフォーム |
| 対象ユーザー | `@estyle-inc.jp` ドメインのGoogleアカウント保有者 |
| 管理者機能 | 閲覧ログのCSVダウンロード（Firestoreの `admins` コレクションで管理） |

---

## システム全体構成図

```mermaid
graph TD
    User[👤 ユーザー<br/>ブラウザ] -->|アクセス| Vercel[Vercel<br/>フロントエンド]
    Vercel -->|Googleログイン| FirebaseAuth[Firebase Auth<br/>認証サービス]
    Vercel -->|動画データ取得| Flask[Flask バックエンド<br/>Python]
    Flask -->|データ取得| GAS[Google Apps Script]
    GAS -->|読み取り| Sheets[📊 Google スプレッドシート<br/>動画マスターデータ]
    Vercel -->|サムネイル取得| Drive[Google Drive<br/>動画ファイル置き場]
    Vercel -->|マイリスト・履歴・ログ保存| Firestore[Cloud Firestore<br/>データベース]
    FirebaseFunc[Firebase Functions<br/>Node.js] -->|定期実行| Firestore
    FirebaseFunc -->|CSVアップロード| Drive
    FirebaseFunc -->|CSVアップロード| Storage[Firebase Storage]

    style User fill:#f0f0f0,stroke:#333
    style Vercel fill:#f9a,stroke:#333
    style Flask fill:#9cf,stroke:#333
    style FirebaseAuth fill:#fa9,stroke:#333
    style Firestore fill:#fa9,stroke:#333
    style FirebaseFunc fill:#fa9,stroke:#333
    style GAS fill:#9f9,stroke:#333
    style Sheets fill:#9f9,stroke:#333
    style Drive fill:#9f9,stroke:#333
    style Storage fill:#fa9,stroke:#333
```

---

## ユーザー操作のデータフロー（シーケンス図）

```mermaid
sequenceDiagram
    actor User as ユーザー
    participant Front as Vercel<br/>(React)
    participant Auth as Firebase Auth
    participant Flask as Flask<br/>バックエンド
    participant GAS as Google<br/>Apps Script
    participant Sheets as スプレッド<br/>シート
    participant FS as Firestore

    User->>Front: サイトにアクセス
    Front->>Auth: Googleログインを要求
    Auth-->>Front: 認証結果を返す
    Front->>Front: @estyle-inc.jp チェック
    Front->>FS: adminsコレクションで管理者判定

    Front->>Flask: GET /api/videos
    Flask->>GAS: データ取得リクエスト
    GAS->>Sheets: スプレッドシート読み取り
    Sheets-->>GAS: 動画データ
    GAS-->>Flask: JSON形式で返す
    Flask-->>Front: 動画一覧データ

    User->>Front: 動画を選択・再生
    Front->>FS: 視聴履歴を保存
    Front->>FS: 閲覧ログを保存
```

---

## 技術スタック一覧

| レイヤー | 技術 | 役割 |
|----------|------|------|
| フロントエンド | React + Vite | UIの構築 |
| スタイリング | Tailwind CSS | デザイン |
| ホスティング | Vercel | フロントエンドの公開 |
| 認証 | Firebase Authentication | Googleログイン |
| データベース | Cloud Firestore | マイリスト・視聴履歴・閲覧ログ |
| バックエンド | Python Flask | 動画データのAPI |
| データ管理 | Google スプレッドシート + GAS | 動画マスターデータ |
| 動画ファイル | Google Drive | 動画の保存・再生 |
| バッチ処理 | Firebase Functions | 閲覧ログの定期CSV保存 |
| ストレージ | Firebase Storage | CSVファイルの保存 |
