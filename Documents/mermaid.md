# E-FLIX システム全体構成・処理フロー図

このドキュメントは、E-FLIXアプリの全体像・構成・データの流れ・各ファイルやサービスのつながりを一目で理解できるようにまとめています。  
**この1ファイルを見れば、E-FLIXの「どこで何が動き、どう連携しているか」が分かります。**

---

## 1. システム全体構成図

```mermaid
graph TD
    %% メインアプリケーション構成
    User[ブラウザ/ユーザー] --> |アクセス| Frontend[Reactフロントエンド<br/>localhost:5173]
    Frontend --> |認証| Firebase[Firebase Auth]
    Frontend --> |API呼び出し| Backend[Flaskバックエンド<br/>localhost:5000]
    Backend --> |データ取得| GAS[Google Apps Script]
    GAS --> |読み取り| Sheets[Googleスプレッドシート]
    Frontend --> |サムネイル取得| Drive[Google Drive API]

    %% フロントエンド詳細構成
    subgraph Frontend構成
        App[App.jsx] --> |認証状態管理| Login[LoginScreen]
        App --> |ヘッダー表示| Header[Header]
        App --> |動画一覧表示| VideoCard[VideoCard]
        App --> |動画詳細表示| Modal[VideoModal]
        App --> |マイリスト/履歴| VideoModalList[VideoModalList]
        App --> |イントロ演出| IntroScreen[IntroScreen]
    end

    %% ファイル依存関係
    subgraph ファイル構成
        IndexHTML[index.html] --> MainJSX[main.jsx]
        MainJSX --> AppJSX[App.jsx]
        AppJSX --> |スタイル| AppCSS[App.css]
        AppJSX --> |グローバルスタイル| IndexCSS[index.css]
        ViteConfig[vite.config.js] --> |ビルド設定| IndexHTML
        TailwindConfig[tailwind.config.js] --> |CSS設定| PostCSSConfig[postcss.config.js]
    end

    %% バックエンド構成
    subgraph バックエンド構成
        AppPY[app.py] --> |CORS設定| Frontend
        AppPY --> |データフェッチ| GAS
    end

    %% スタイル定義
    classDef frontend fill:#f9f,stroke:#333,stroke-width:2px
    classDef backend fill:#9ff,stroke:#333,stroke-width:2px
    classDef external fill:#ff9,stroke:#333,stroke-width:2px

    %% スタイル適用
    class Frontend frontend
    class Backend backend
    class Firebase,GAS,Sheets,Drive external
```
```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Frontend as Reactフロントエンド
    participant Firebase as Firebase Auth
    participant Backend as Flaskバックエンド
    participant GAS as Google Apps Script
    participant Sheets as Googleスプレッドシート
    participant Drive as Google Drive

    User->>Frontend: サイトアクセス
    Frontend->>Firebase: Googleログイン
    Firebase-->>Frontend: 認証結果
    
    alt 認証成功
        Frontend->>Backend: GET /api/videos
        Backend->>GAS: データ取得リクエスト
        GAS->>Sheets: スプレッドシート読み取り
        Sheets-->>GAS: データ
        GAS-->>Backend: JSON形式データ
        Backend-->>Frontend: 動画一覧データ
        
        loop 各動画
            Frontend->>Drive: サムネイル取得
            Drive-->>Frontend: サムネイル画像
        end
        
        Frontend-->>User: 動画一覧表示
    else 認証失敗
        Frontend-->>User: ログイン画面表示
    end

    User->>Frontend: 動画選択
    Frontend-->>User: モーダルで動画再生
```

このMermaid図は以下を表現しています：

1. 全体のシステム構成図（上部）
   - ユーザーからGoogleスプレッドシートまでのデータフロー
   - フロントエンド、バックエンド、外部サービスの関係

2. フロントエンドの詳細構成（中部）
   - App.jsxを中心としたコンポーネント構成
   - 各ファイルの依存関係

3. シーケンス図（下部）
   - ユーザーアクションから始まる一連の処理フロー
   - 認証からデータ表示までの時系列的な流れ

色分けによる分類：
- フロントエンド（ピンク系）
- バックエンド（水色系）
- 外部サービス（黄色系）