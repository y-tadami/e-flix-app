# main.jsx 解説ドキュメント

## 1. エントリーポイントの役割

- Reactアプリの起動ファイル
- App.jsx（メイン画面）を#rootにマウント
- Tailwind CSSのスタイルを全体に適用
- StrictModeで開発時のバグ検出を強化

---

## 2. ファイル構成と流れ

```mermaid
flowchart TD
    main[main.jsx] --> App[App.jsx]
    main --> Style[index.css]
    main --> Strict[React.StrictMode]
    App -->|マウント| Root[DOM #root]
```

## 3. 初期化フロー
```mermaid
sequenceDiagram
    participant M as main.jsx
    participant R as React
    participant A as App
    participant D as DOM

    M->>R: StrictMode有効化
    M->>R: createRoot呼び出し
    R->>D: #root要素取得
    M->>A: Appコンポーネント作成
    A->>D: DOM要素としてレンダリング
```

## 4. 重要ポイント

### StrictModeの役割
- 開発時の潜在的な問題の検出
- 安全でない lifecycles の検出
- レガシーな API 使用の警告
- 副作用の二重実行によるバグ検出

### レンダリングプロセス
1. #root 要素の取得
2. React ルートの作成
3. StrictMode でのラップ
4. App コンポーネントのマウント

## 5. 依存関係図
```mermaid
classDiagram
    class MainJSX {
        +render()
    }
    class ReactDOM {
        +createRoot()
    }
    class StrictMode {
        +wrap()
    }
    class AppJSX {
        +render()
    }
    class IndexCSS {
        styles
    }

    MainJSX --> ReactDOM
    MainJSX --> StrictMode
    MainJSX --> AppJSX
    MainJSX --> IndexCSS
```

## 6. デバッグポイント

### 開発環境での動作
- StrictMode による二重レンダリング
- コンポーネントのマウント確認
- CSS の適用確認

### よくあるエラー
1. #root 要素不在
   - index.html の確認
2. App コンポーネントのインポートエラー
   - パス指定の確認
3. CSS 読み込みエラー
   - ビルド設定の確認

## 7. Viteとの関係

### 開発サーバー
- デフォルトポート: 5173
- HMR (Hot Module Replacement) 対応
- ソースマップ対応

### ビルド時の最適化
- Tree-shaking
- コード分割
- アセット最適化