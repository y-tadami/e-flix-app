# tailwind.config.js 解説ドキュメント

## 1. 設定概要
```mermaid
graph TD
    A[tailwind.config.js] -->|コンテンツ定義| B[content]
    A -->|テーマ設定| C[theme]
    A -->|プラグイン| D[plugins]
    A -->|カスタマイズ| E[extend]
```

## 2. 基本設定

### 設定ファイル構造
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## 3. スタイル適用フロー

```mermaid
sequenceDiagram
    participant S as ソースファイル
    participant T as Tailwind
    participant P as PostCSS
    participant C as 最終CSS

    S->>T: クラス使用検出
    T->>P: スタイル生成
    P->>C: CSS最適化
    C->>S: スタイル適用
```

## 4. カスタマイズ設定

### テーマ拡張例
```javascript
theme: {
  extend: {
    colors: {
      'e-flix': {
        primary: '#E50914',
        secondary: '#141414',
        accent: '#FFFFFF',
      }
    },
    fontFamily: {
      sans: ['Noto Sans JP', 'sans-serif'],
    }
  }
}
```

## 5. レスポンシブデザイン

### ブレークポイント設定
```mermaid
graph LR
    A[sm: 640px] -->|小画面| B[md: 768px]
    B -->|中画面| C[lg: 1024px]
    C -->|大画面| D[xl: 1280px]
    D -->|超大画面| E[2xl: 1536px]
```

## 6. ユーティリティクラス

### よく使用するクラス
```mermaid
mindmap
  root((Tailwind))
    Layout
      flex
      grid
      container
    Spacing
      padding
      margin
      gap
    Typography
      font-size
      font-weight
      text-color
    Backgrounds
      bg-color
      opacity
      gradient
```

## 7. パフォーマンス最適化

### JIT（Just-In-Time）モード
```mermaid
flowchart TD
    A[開発時] -->|オンデマンド生成| B[必要なクラスのみ]
    B --> C[高速な開発体験]
    A -->|本番ビルド| D[最適化されたCSS]
```

## 8. デバッグとトラブルシューティング

### よくある問題と解決策
1. スタイルが適用されない
   - content配列のパス確認
   - PostCSS設定の確認
   - キャッシュのクリア

2. カスタム設定が反映されない
   - 設定ファイルの構文確認
   - extend内の配置確認
   - 開発サーバーの再起動

3. ビルド時の最適化問題
   - purge設定の確認
   - safelist の確認
   - node_modules の再インストール

## 9. VS Code 連携

### 推奨拡張機能
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "csstools.postcss",
    "kokororin.vscode-phpfmt"
  ]
}
```

### インテリセンス設定
```mermaid
graph TD
    A[VS Code] -->|補完機能| B[Tailwind CSS IntelliSense]
    B --> C[クラス補完]
    B --> D[ホバープレビュー]
    B --> E[構文ハイライト]
```

## 10. セキュリティと最適化

### プロダクション設定
```javascript
module.exports = {
  mode: 'jit',
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: [
      './src/**/*.{js,jsx,ts,tsx}',
      './public/index.html'
    ],
    options: {
      safelist: []
    }
  }
}
```