# ディレクトリ構成・ファイル説明

---

## フォルダ全体構成

```
e-flix-app/
├── frontend/                  ← Reactフロントエンド（Vercelにデプロイ）
│   ├── src/
│   │   ├── App.jsx            ← メインコンポーネント（画面全体の制御）
│   │   ├── firebase.js        ← Firebase初期化・設定の集約
│   │   ├── main.jsx           ← アプリのエントリーポイント
│   │   ├── index.css          ← グローバルCSS
│   │   ├── App.css            ← Appコンポーネント用CSS
│   │   ├── components/        ← 画面の部品（コンポーネント）
│   │   │   ├── Header.jsx         ← ヘッダーナビゲーション
│   │   │   ├── VideoCard.jsx      ← 動画サムネイルカード
│   │   │   ├── VideoModal.jsx     ← 動画再生モーダル
│   │   │   ├── VideoModalList.jsx ← マイリスト・視聴履歴モーダル
│   │   │   ├── LoginScreen.jsx    ← ログイン画面
│   │   │   └── IntroScreen.jsx    ← 起動時のイントロ演出
│   │   ├── services/
│   │   │   └── firestore.js   ← Firestoreへの読み書き関数
│   │   └── utils/
│   │       └── helpers.js     ← 汎用ユーティリティ関数
│   ├── public/
│   │   └── E-FLIXイントロだだーん.mp4  ← イントロ音声
│   ├── index.html             ← HTMLテンプレート
│   ├── vite.config.js         ← Viteビルド設定
│   ├── tailwind.config.js     ← Tailwind CSS設定
│   ├── package.json           ← npmパッケージ定義
│   └── .env                   ← 環境変数（GitHubに上げない）
│
├── backend/                   ← Pythonバックエンド（Flask）
│   ├── app.py                 ← APIサーバー本体
│   ├── requirements.txt       ← Pythonパッケージ一覧
│   └── .env                   ← 環境変数（GitHubに上げない）
│
├── functions/                 ← Firebase Cloud Functions（Node.js）
│   ├── index.js               ← 定期実行バッチ（閲覧ログCSV保存）
│   └── .env                   ← 環境変数（GitHubに上げない）
│
└── Documents/                 ← 設計書・説明ドキュメント（このフォルダ）
```

---

## 各ファイルの役割詳細

### `frontend/src/firebase.js`
FirebaseとFirestoreの初期化設定を1ファイルに集約しています。  
`auth`・`db`・`provider`・`ALLOWED_DOMAIN`・`API_URL` をエクスポートし、他のファイルから `import` して使います。

### `frontend/src/services/firestore.js`
Firestoreとのやりとりをすべてここに集約しています。

| 関数名 | 役割 |
|--------|------|
| `addToMyList` | マイリストに動画を追加 |
| `fetchMyList` | マイリストを取得 |
| `addToHistory` | 視聴履歴に追加 |
| `fetchHistory` | 視聴履歴を取得 |
| `addViewLog` | 閲覧ログをFirestoreに記録 |
| `checkIsAdmin` | 管理者かどうか確認 |
| `downloadLogsAsCSV` | ログをCSVとしてダウンロード |
| `deleteSelectedItems` | 選択した履歴・マイリストを削除 |

### `frontend/src/utils/helpers.js`
どのコンポーネントからも使う汎用関数をまとめています。

| 関数名 | 役割 |
|--------|------|
| `extractDriveId` | Google DriveのURLからファイルIDを抽出 |
| `getDriveThumbnailUrl` | ファイルIDからサムネイルURLを生成 |
| `thumbnailFor` | 動画オブジェクトから表示用サムネイルURLを返す |
| `formatExpireDate` | 視聴期限の日付を日本語形式に整形 |

### `backend/app.py`
Google Apps Script（GAS）からスプレッドシートのデータを取得し、フロントエンドに返すAPIサーバーです。  
エンドポイントは `/api/videos` のみ。

### `functions/index.js`
月1回（Cloud Schedulerで設定）、Firestoreの閲覧ログをCSV化して Google Drive と Firebase Storage に保存します。
