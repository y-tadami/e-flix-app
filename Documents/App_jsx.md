# App.jsx 概要（2025/11/3時点 最新版）

このファイルはE-FLIXアプリのメイン画面を構成します。  
主な役割は「認証」「動画データの取得」「画面の切り替え」「マイリスト・履歴管理」です。

---

## 主な構成とつながり

```mermaid
flowchart TD
    Login[ログイン画面] --> Intro[イントロ画面]
    Intro --> Top[トップページ]
    Top -->|動画クリック| Modal[動画詳細モーダル]
    Top -->|マイリスト| MyList[マイリストモーダル]
    Top -->|視聴履歴| History[履歴モーダル]
    Modal -->|再生| History
    Modal -->|ハート| MyList
    MyList -->|サムネイルクリック| Modal
    History -->|サムネイルクリック| Modal
````

## 主な構成

### Firebase認証
- Googleアカウントでログインし、社内メールのみ許可
- Firebaseの初期化・認証はファイル冒頭で行う
- ALLOWED_DOMAINでドメイン制限を実装

### イントロ画面
- ログイン後にESTYLEロゴ＋サウンドを2秒表示

### 動画一覧・おすすめ動画
- おすすめ動画は大きく表示
- 全動画リストはカテゴリや検索で絞り込み可能
- サムネイルはFirebase StorageのURLやGoogle Driveリンクから自動生成

### 動画詳細モーダル
- 再生ボタンで履歴追加
- ハートボタンでマイリスト追加

### マイリスト・視聴履歴モーダル
- Firestoreに保存
- 選択削除やサムネイルクリックで再生可能

### ヘッダー
- カテゴリメニューとユーザーメニューは独立して開閉管理
- モバイル・PC両対応

---

## 主要な状態管理

- **user**：ログイン中のユーザー情報
- **videos**：全動画データ
- **selectedVideo**：詳細表示中の動画
- **searchTerm**：検索ワード
- **selectedCategory**：選択中カテゴリ
- **myList / history**：マイリスト・履歴
- **showIntro**：イントロ画面表示フラグ
- **showMyList / showHistory**：各モーダル表示フラグ
- **isLoading / dataError**：データ取得状態

---
## 主な関数

| 関数名 | 引数 | 主な処理内容 |
|--------|------|-------------|
| handleLogin | なし | Google認証を開始し、許可ドメインならuserをセット |
| handleLogout | なし | Firebaseからサインアウトし、userや状態をリセット |
| fetchVideos | なし | バックエンドAPIから動画リストを取得しvideosにセット |
| addToMyList | video, user | Firestoreのmylistコレクションに動画を追加（ID重複時は上書き） |
| addToHistory | video, user | Firestoreのhistoryコレクションに動画を追加（ID重複時は最新日時で上書き） |
| deleteAllHistory | user, onDeleted | Firestoreのhistoryコレクションを全削除 |
| deleteDoc | user, id, type | Firestoreのmylistまたはhistoryから指定IDの動画を削除 |
| handleOpenModal | video | selectedVideoをセットし詳細モーダルを表示 |
| handleCloseModal | なし | selectedVideoをnullにし詳細モーダルを閉じる |
| fetchMyList | user | Firestoreからマイリストを取得 |
| fetchHistory | user | Firestoreから履歴を取得しviewedAtで降順ソート |

---

## サムネイル画像の取得ロジック

- **video.thumbnail優先**：Firebase Storage等のURLがあればそれを使用
- **Google Driveリンク自動生成**：thumbnailがなければDriveリンクからIDを抽出してサムネイルURLを生成
- **ダミー画像表示**：どちらもない場合はplacehold.coのダミー画像を表示

---

## 画面遷移イメージ

1. ログイン画面 → イントロ画面 → トップページ
2. トップページで動画クリック → 詳細モーダル
3. ユーザーメニューからマイリスト・履歴モーダル表示

---

## ポイント
- 直感的なUIで動画視聴・管理が可能
- Firestoreでユーザーごとにマイリスト・履歴を保存
- イントロ演出や選択削除など、使いやすさを重視
- サムネイル画像はFirebase Storage推奨（Google DriveはCORS制限に注意）

---

## Firestore 構成

```
users/{uid}/mylist/{動画ID}
  └─ title: "動画タイトル"
  └─ summary: "概要"
  └─ category: "ML"
  └─ driveLink: "https://..."
  └─ ...（その他動画情報）

users/{uid}/history/{動画ID}
  └─ title: "動画タイトル"
  └─ summary: "概要"
  └─ category: "ML"
  └─ driveLink: "https://..."
  └─ viewedAt: Timestamp（視聴日時）
  └─ ...（その他動画情報）
```

## 主要なUIコンポーネントのprops・イベント

### Header

- **props**
  - `setSearchTerm`：検索ワードを更新する関数
  - `onCategoryChange`：カテゴリ切り替え関数
  - `user`：ユーザー情報
  - `handleLogout`：ログアウト関数
  - `handleShowMyList` / `handleShowHistory`：各モーダル表示関数

---

### VideoCard

- **props**
  - `video`：動画情報オブジェクト
  - `onClick`：カードクリック時の処理（詳細モーダル表示）
  - `user`：ユーザー情報
- **イベント**
  - ハートボタン押下で`addToMyList`実行

---

### VideoModal

- **props**
  - `video`：詳細表示する動画
  - `onClose`：モーダルを閉じる関数
  - `user`：ユーザー情報
- **イベント**
  - 再生ボタン押下で`addToHistory`実行
  - ハートボタン押下で`addToMyList`実行

---

### VideoModalList（マイリスト・履歴モーダル）

- **props**
  - `title`：モーダルタイトル
  - `videos`：表示する動画リスト
  - `onClose`：モーダルを閉じる関数
  - `user`：ユーザー情報
  - `setHistory` / `setMyList`：リスト更新関数
- **イベント**
  - サムネイルクリックで`handleOpenModal`
  - チェックボックス選択で複数削除