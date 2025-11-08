# package.json 解説ドキュメント

## 1. 依存関係構造
```mermaid
graph TD
    A[package.json] -->|本番依存| B[dependencies]
    A -->|開発依存| C[devDependencies]
    A -->|スクリプト| D[scripts]
    A -->|設定| E[その他設定]
```

## 2. 主要設定
```json
{
  "name": "e-flix-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  }
}
```

## 3. 依存関係マップ
```mermaid
mindmap
  root((Dependencies))
    本番環境
      react
      react-dom
      firebase
    開発環境
      vite
      eslint
      tailwindcss
      postcss
```