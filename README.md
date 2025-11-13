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
  
### backend/
* Python FlaskでAPIサーバーを構築
* Googleスプレッドシートから講義データを取得しAPIで提供
* CORS対応
* Renderでデプロイ


## デプロイ・運用
* フロントエンド：VercelでfrontendディレクトリをRoot Directoryに指定してデプロイ
* バックエンド：RenderでbackendディレクトリをRoot Directoryに指定してデプロイ


## 環境変数・設定
* フロントエンド、バックエンドともに.envファイルでAPIキーやURLを管理
* Vercel/Renderの「Environment Variables」にも同じ値を設定


## 注意事項
* サインインには@estyle-inc.jpのGoogleアカウントが必要です
* サムネイル画像はFirebase Storage推奨（Google DriveはCORS制限あり）
* バックエンドAPIやスプレッドシートの仕様変更時はREADMEも更新してください


## ライセンス
社内利用限定
