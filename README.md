# 📚 ISBN Reader

画像からISBNを読み取って本の情報を取得・共有するWebアプリケーション

## ✨ 機能

- 📷 **画像アップロード**: ドラッグ&ドロップまたはファイル選択
- 📱 **カメラ撮影**: リアルタイムカメラで直接撮影
- 🔍 **OCR処理**: Tesseract.jsによる高精度文字認識
- 📖 **ISBN認識**: ISBN-10/13形式の自動検出・バリデーション
- 📚 **本情報取得**: Google Books APIで詳細情報取得
- 🐦 **SNS共有**: X（Twitter）、Slack、クリップボードコピー
- 📱 **レスポンシブ**: モバイル・デスクトップ対応

## 🛠 技術スタック

- **フロントエンド**: Next.js 15 + TypeScript + Tailwind CSS
- **OCR**: Tesseract.js
- **API**: Google Books API
- **テスト**: Jest + React Testing Library（TDD方式）
- **デプロイ**: Vercel対応

## 🚀 セットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 開発サーバー起動
```bash
npm run dev
```

### 3. ブラウザでアクセス
```
http://localhost:3000
```

## 🧪 テスト

```bash
# 全テスト実行
npm test

# ウォッチモード
npm run test:watch

# カバレッジ付き
npm test -- --coverage
```

## 📦 ビルド・デプロイ

```bash
# ビルド
npm run build

# 本番サーバー起動
npm start

# Vercelデプロイ
vercel --prod
```

## 🏗 プロジェクト構造

```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # ルートレイアウト
│   ├── page.tsx        # ホームページ
│   └── globals.css     # グローバルスタイル
├── components/          # Reactコンポーネント
│   ├── ImageUpload.tsx # 画像アップロード
│   ├── CameraCapture.tsx # カメラ撮影
│   └── BookDisplay.tsx # 本情報表示
├── lib/                # ユーティリティ関数
│   ├── ocr.ts          # OCR処理
│   ├── camera.ts       # カメラ機能
│   ├── googleBooks.ts  # API連携
│   └── share.ts        # 共有機能
└── types/              # TypeScript型定義
    └── index.ts
```

## 📱 使用方法

1. **画像アップロード**: 本の裏表紙やISBNが写った画像をアップロード
2. **カメラ撮影**: モバイルデバイスでカメラ撮影
3. **OCR処理**: 自動でISBNを読み取り
4. **本情報表示**: Google Books APIから詳細情報を取得
5. **共有**: SNSやクリップボードで簡単共有

## 🧪 TDD開発

このプロジェクトはテスト駆動開発（TDD）で作成されています：

- ✅ 37テストケース全通過
- 🔍 OCR機能のテスト
- 📷 カメラ機能のテスト
- 📚 Google Books API連携テスト
- 🔄 共有機能のテスト
- 🖼 画像アップロード機能のテスト

## 🤖 GitHub Actions (Claude Code Actions)

このリポジトリには包括的なCI/CDパイプラインが設定されています：

### 🔧 自動化されたワークフロー

- **📝 コードチェック**: ESLint、TypeScriptチェック、テスト実行
- **🏗 ビルド**: 本番環境向け最適化ビルド
- **🚀 デプロイ**: Vercel自動デプロイ（本番・プレビュー）
- **🔒 セキュリティ**: 脆弱性スキャン・監査
- **⚡ パフォーマンス**: Lighthouse CI品質測定
- **📈 品質**: SonarCloud・CodeClimate統合

### 🔑 必要なSecrets設定

GitHub Settings > Secrets and variables > Actions で以下を設定：

```bash
# Vercel デプロイ用
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id

# コードカバレッジ用
CODECOV_TOKEN=your_codecov_token
CC_TEST_REPORTER_ID=your_codeclimate_id

# 品質チェック用
SONAR_TOKEN=your_sonarcloud_token

# Lighthouse CI用 (オプショナル)
LHCI_GITHUB_APP_TOKEN=your_lighthouse_token
```

### 📊 品質ゲート

- **テストカバレッジ**: 全36テストケース通過必須
- **Lighthouse スコア**: Performance ≥ 80%, Accessibility ≥ 90%
- **ESLint**: エラーゼロ必須
- **TypeScript**: 型エラーゼロ必須
- **セキュリティ**: 高脆弱性ゼロ必須

## 📄 ライセンス

MIT License