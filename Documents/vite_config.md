# vite.config.js 解説ドキュメント

## 1. 設定構造
```mermaid
graph TD
    A[vite.config.js] -->|プラグイン| B[react]
    A -->|設定| C[build]
    A -->|開発サーバー| D[server]
    B -->|JSX変換| E[トランスパイル]
    C -->|出力| F[dist]
    D -->|ポート| G[5173]
```

## 2. 基本設定

### 設定ファイル構造
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
```

## 3. プラグインシステム

### React設定フロー
```mermaid
sequenceDiagram
    participant V as Vite
    participant R as React Plugin
    participant B as Babel
    participant H as HMR

    V->>R: プラグイン初期化
    R->>B: JSX変換設定
    R->>H: HMR設定
    H->>V: 開発サーバー反映
```

## 4. ビルド設定オプション

### ビルド出力構造
```mermaid
flowchart TD
    A[ソースコード] -->|ビルド| B[dist/]
    B --> C[index.html]
    B --> D[assets/]
    D --> E[JS]
    D --> F[CSS]
    D --> G[画像]
```

## 5. 開発サーバー設定

### サーバー構成
```mermaid
graph LR
    A[Vite Dev Server] -->|5173| B[ブラウザ]
    A -->|HMR| C[ファイル監視]
    A -->|CORS| D[API通信]
```

## 6. 環境変数設定

### 環境変数フロー
```mermaid
flowchart TD
    A[.env] -->|読み込み| B[vite.config.js]
    B -->|変数展開| C[import.meta.env]
    C -->|アプリケーション| D[使用可能]
```

## 7. パフォーマンス最適化

### ビルド最適化設定
```javascript
{
  build: {
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    },
    chunkSizeWarningLimit: 500
  }
}
```

## 8. よくあるトラブルシューティング

### 1. HMRが機能しない
- 原因：
  - プラグイン設定ミス
  - ファイル監視設定の問題
- 対処：
  - プラグインの再確認
  - server.watchOptions の確認

### 2. ビルドエラー
- 原因：
  - 依存関係の問題
  - パス解決の失敗
- 対処：
  - node_modules の削除と再インストール
  - resolve.alias の確認

### 3. 環境変数が読み込めない
- 原因：
  - .env ファイルの配置ミス
  - 変数名のプレフィックス不足
- 対処：
  - VITE_ プレフィックスの確認
  - envDir 設定の確認

## 9. プロダクション対応

### デプロイメント準備
```mermaid
flowchart TD
    A[開発環境] -->|npm run build| B[ビルド処理]
    B --> C[最適化]
    C --> D[dist/]
    D --> E[デプロイ]
```

### チェックリスト
1. 環境変数の設定
2. ベースパスの確認
3. SSR対応の確認
4. キャッシュ設定
5. CSP対応