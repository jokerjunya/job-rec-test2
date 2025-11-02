# Job Recommendation Test Project

求人レコメンデーションシステムのプロトタイプ。Next.js + TypeScript + Firebaseで構築されています。

## 🚀 Getting Started

### 1. Firebase設定

#### Firebase プロジェクトの作成
1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. 新しいプロジェクトを作成
3. Authentication を有効化（メール/パスワード認証を有効化）
4. Firestore Database を作成（テストモードで開始）

#### 環境変数の設定
`.env.local`ファイルをプロジェクトルートに作成し、Firebase設定を追加：

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

#### Firestoreセキュリティルールのデプロイ
```bash
# Firebase CLIのインストール（初回のみ）
npm install -g firebase-tools

# Firebaseにログイン
firebase login

# プロジェクトの初期化
firebase init firestore

# セキュリティルールのデプロイ
firebase deploy --only firestore:rules
```

#### ダミーデータのマイグレーション（オプション）
サービスアカウントキーを取得し、ダミーデータをFirestoreに投入：

```bash
# サービスアカウントキーを取得（Firebase Console > プロジェクト設定 > サービスアカウント）
# ダウンロードしたJSONファイルのパスを環境変数に設定
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"

# マイグレーションスクリプトを実行
npm run migrate:firebase
```

### 2. 開発サーバーを起動

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) をブラウザで開いてください。

## 🧪 テスト

```bash
# すべてのテストを実行
npm test

# ウォッチモードでテスト実行
npm run test:watch

# カバレッジレポート生成
npm run test:coverage
```

## ✨ 主な機能

### 🎯 レコメンデーション機能（NEW!）

**ユーザーベース協調フィルタリングによる求人推薦システム**

- **類似ユーザー発見**: あなたと似た好みのユーザーを自動的に発見
  - コサイン類似度とピアソン相関係数によるハイブリッド計算
  - 上位3人の類似ユーザーを表示
  
- **パーソナライズドレコメンド**: 類似ユーザーの行動に基づいた求人推薦
  - 協調フィルタリングアルゴリズムによる予測評価
  - レコメンド理由の可視化
  - 5件の厳選されたおすすめ求人を表示

- **リアルなダミーデータ**: 35人のダミーユーザーと597件の評価データ
  - ユーザープロファイルに基づいた一貫性のある評価行動
  - 経験レベル、興味分野、給与期待値などの多様な属性
  - 時系列を考慮したフィードバックデータ

アクセス: ログイン後、ナビゲーションバーの「おすすめ」タブから利用可能

### 📊 データ基盤の特徴

### 最近の改善点（2025-11-02）

#### レコメンデーションシステムの追加
- **協調フィルタリング**: ユーザー間の類似度計算とレコメンド生成
- **類似度計算手法**:
  - コサイン類似度: ベクトルの角度の近さを測定
  - ピアソン相関係数: 評価傾向の相関を測定
  - ジャッカード係数: 評価アイテムの集合の類似度を測定
  - ハイブリッド手法: 複数手法の加重平均
- **データ検証**: 35人のユーザー、597件の評価データ（Like率: 44%）
- **テストカバレッジ**: 86個のテストケース（類似度計算、レコメンド生成を含む）

#### 1. ダミーデータの品質向上
- **職種とスキルのマッピング**: 各職種に関連性の高いスキルを優先的に割り当て
  - 例：フロントエンドエンジニアには React, TypeScript, Next.js など
  - 検証結果：60-100%のスキルが職種に関連
- **企業と業界の関連性**: 企業名に基づいた現実的な業界割り当て
  - 例：フィンテックソリューションズ → 金融・FinTech
  - 検証結果：100%の一貫性を確認

#### 2. パフォーマンス最適化
- **Fisher-Yatesシャッフル実装**: 偏りのない均等な確率でのシャッフル
  - 検証結果：10,000回のテストで期待値±1%以内の均等性を確認
- **getRandomElements最適化**:
  - 少数選択時（< 50%）: O(n) の重複チェック方式
  - 多数選択時（≥ 50%）: O(n log n) のシャッフル方式
  - 自動的に最適なアルゴリズムを選択

#### 3. テストコードの追加
- **テストカバレッジ**: 86個のテストケースで主要機能をカバー
  - データ生成ユーティリティのテスト
  - 相関分析ロジックのテスト
  - データジェネレーターのテスト
  - ユーザー類似度計算のテスト（NEW!）
  - レコメンデーションエンジンのテスト（NEW!）
- **テストフレームワーク**: Jest + Testing Library

### データ統計
- 総求人数: 100件
- 総ユーザー数: 35人（NEW!）
- 総評価数: 597件（NEW!）
- Like率: 44%（NEW!）
- 平均評価数/人: 17件（NEW!）
- 職種の種類: 48種類
- 企業の種類: 20社
- スキルの種類: 91種類
- 業界の種類: 16業界

## 🏗️ プロジェクト構造

```
.
├── app/                         # Next.js App Router
│   ├── recommendations/         # レコメンドページ（NEW!）
│   ├── compare/                 # 比較ページ
│   └── logs/                    # 履歴ページ
├── components/                  # Reactコンポーネント
│   ├── similar-users.tsx        # 類似ユーザー表示（NEW!）
│   ├── recommended-jobs.tsx     # レコメンド求人表示（NEW!）
│   ├── job-card.tsx
│   ├── job-list.tsx
│   └── ...
├── contexts/                    # Reactコンテキスト
│   └── auth-context.tsx
├── data/                        # ダミーデータ生成
│   ├── dummy-data.ts            # データ統合エクスポート（NEW!）
│   ├── jobs.ts
│   └── generators/              # データ生成ロジック
│       ├── user-profiles.ts     # ユーザープロファイル生成（NEW!）
│       ├── user-feedbacks.ts    # フィードバックデータ生成（NEW!）
│       ├── mappings.ts          # 職種-スキル、企業-業界のマッピング
│       ├── utils.ts             # ユーティリティ関数
│       └── company-attributes.ts
├── hooks/                       # カスタムフック
│   └── use-job-feedback.ts
├── types/                       # TypeScript型定義
│   ├── user-profile.ts          # ユーザープロファイル型（NEW!）
│   ├── job.ts
│   └── user.ts
├── utils/                       # ユーティリティ関数
│   ├── user-similarity.ts       # ユーザー類似度計算（NEW!）
│   ├── recommendation.ts        # レコメンドエンジン（NEW!）
│   ├── analysis.ts              # 相関分析
│   └── local-storage.ts         # ローカルストレージ管理
├── scripts/                     # 開発支援スクリプト
│   ├── verify-dummy-data.ts     # ダミーデータ検証（NEW!）
│   ├── check-data.ts            # データ構造確認
│   └── verify-improvements.ts   # 改善内容の検証
└── __tests__/                   # テストコード
    ├── utils/
    │   ├── user-similarity.test.ts       # 類似度計算テスト（NEW!）
    │   ├── recommendation.test.ts        # レコメンドテスト（NEW!）
    │   └── ...
    └── data/
        ├── user-profiles.test.ts         # プロファイル生成テスト（NEW!）
        └── ...
```

## 📝 開発スクリプト

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm start

# Lintチェック
npm run lint

# テスト実行
npm test

# テストカバレッジ
npm run test:coverage

# データ構造確認
npx tsx scripts/check-data.ts

# 改善内容の検証
npx tsx scripts/verify-improvements.ts

# ダミーデータ検証
npx tsx scripts/verify-dummy-data.ts

# Firebaseマイグレーション（NEW!）
npm run migrate:firebase
```

## 🎯 技術スタック

- **フレームワーク**: Next.js 16.0.1
- **言語**: TypeScript 5
- **UI**: React 19.2.0
- **スタイリング**: Tailwind CSS 4
- **テスト**: Jest 29.7.0 + Testing Library
- **アイコン**: Lucide React
- **バックエンド**: Firebase (Authentication + Firestore)
- **認証**: Firebase Authentication（メール/パスワード認証）
- **データベース**: Cloud Firestore

## 🔒 セキュリティとデータ管理

### Firebase Authentication
- メール/パスワード認証を使用
- パスワードのハッシュ化と安全な保存は自動処理
- パスワードリセット機能（メール送信）

### Firestore データ構造
- **users**: ユーザー情報（自分のデータのみアクセス可能）
- **jobs**: 求人情報（全ユーザー閲覧可能、ダミーデータにはisDummyフラグ付与）
- **feedbacks**: フィードバック情報（自分のフィードバックのみアクセス可能）
- **userProfiles**: ユーザープロファイル（自分のプロファイルのみアクセス可能）

### セキュリティルール
Firestoreセキュリティルール（`firestore.rules`）により、以下を保証：
- ユーザーは自分のデータのみ読み書き可能
- 求人情報は認証済みユーザーのみ閲覧可能
- フィードバックは作成したユーザーのみ変更・削除可能

## 📚 Learn More

Next.jsについて詳しく知りたい場合：

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

## Git Worktree の使い方

このプロジェクトでは、複数のブランチで並行作業を行うために `git worktree` を使用しています。

### 現在のワークツリー一覧

```bash
git worktree list
```

### 新しいワークツリーの作成

新しいブランチを作成してワークツリーを追加する場合：

```bash
# 新しいブランチを作成してワークツリーを追加
git worktree add -b <新しいブランチ名> <ディレクトリパス> <元となるブランチ名>

# 例: mainブランチからfeature-xyzブランチを作成
git worktree add -b feature-xyz ../worktrees/feature-xyz main
```

既存のブランチのワークツリーを追加する場合：

```bash
# 既存のブランチのワークツリーを追加
git worktree add <ディレクトリパス> <ブランチ名>

# 例: hotfixブランチのワークツリーを追加
git worktree add ../worktrees/hotfix hotfix/critical-bug
```

### ワークツリーの削除

不要になったワークツリーを削除する場合：

```bash
# ワークツリーを削除（ディレクトリとブランチは残る）
git worktree remove <ディレクトリパス>

# 例: feature-xyzのワークツリーを削除
git worktree remove ../worktrees/feature-xyz
```

### ワークツリーのメリット

- **ブランチ切り替えの不要**: 異なるブランチの作業をディレクトリ単位で進められる
- **コンテキストスイッチの減少**: 複数の作業を並行して進められる
- **クリーンな作業環境**: 各ワークツリーは独立しているため、作業が他の作業に影響を与えない
- **効率的なレビュー**: レビュー中のブランチと作業中のブランチを同時に開ける

### 注意点

- 同じブランチを複数のワークツリーにチェックアウトすることはできません
- 大量のワークツリーを作成すると、ディスク容量を圧迫する可能性があります
- 各ワークツリーは独立していますが、`.git`ディレクトリは共有されます

### Git エイリアスの設定

ワークツリーの操作を簡単にするために、以下のGitエイリアスが設定されています：

```bash
# ワークツリー一覧を表示
git wt-list

# ワークツリーを追加（既存ブランチ）
git wt-add <ディレクトリパス> <ブランチ名>

# ワークツリーを削除
git wt-remove <ディレクトリパス>
```

### ワークツリーヘルパースクリプト

ワークツリーの操作を簡単にするヘルパースクリプトを用意しています：

```bash
# ワークツリー一覧を表示
./scripts/worktree-helper.sh list

# 新しいブランチを作成してワークツリーを追加
./scripts/worktree-helper.sh create feature-xyz main

# 既存のブランチのワークツリーを追加
./scripts/worktree-helper.sh add hotfix/critical-bug

# ワークツリーを削除
./scripts/worktree-helper.sh remove feature-xyz

# 各ワークツリーの状態を表示
./scripts/worktree-helper.sh status
```

### 現在のワークツリー構成

このプロジェクトの現在のワークツリー構成：

- **メインリポジトリ**: `/Users/01062544/Documents/jobrectest2` (mainブランチ)
- **ワークツリー1**: `/Users/01062544/.cursor/worktrees/jobrectest2/fap2L` (feat-job-list-page-fap2Lブランチ)
- **ワークツリー2**: `/Users/01062544/.cursor/worktrees/jobrectest2/zhdz1` (2025-11-02-gmoe-zhdz1ブランチ)
