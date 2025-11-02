# Job Recommendation Test Project

求人レコメンデーションシステムのプロトタイプ。Next.js + TypeScriptで構築されています。

## 🚀 Getting Started

開発サーバーを起動：

```bash
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

## 📊 データ基盤の特徴

### 最近の改善点（2025-11-02）

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
- **テストカバレッジ**: 59個のテストケースで主要機能をカバー
  - データ生成ユーティリティのテスト
  - 相関分析ロジックのテスト
  - データジェネレーターのテスト
- **テストフレームワーク**: Jest + Testing Library

### データ統計
- 総求人数: 100件
- 職種の種類: 48種類
- 企業の種類: 20社
- スキルの種類: 91種類
- 業界の種類: 16業界

## 🏗️ プロジェクト構造

```
.
├── app/                    # Next.js App Router
├── components/             # Reactコンポーネント
├── contexts/              # Reactコンテキスト
├── data/                  # ダミーデータ生成
│   └── generators/        # データ生成ロジック
│       ├── mappings.ts    # 職種-スキル、企業-業界のマッピング
│       ├── utils.ts       # ユーティリティ関数（Fisher-Yatesシャッフルなど）
│       └── company-attributes.ts
├── hooks/                 # カスタムフック
├── types/                 # TypeScript型定義
├── utils/                 # ユーティリティ関数
│   ├── analysis.ts        # 相関分析
│   └── local-storage.ts   # ローカルストレージ管理
├── scripts/               # 開発支援スクリプト
│   ├── check-data.ts      # データ構造確認
│   └── verify-improvements.ts  # 改善内容の検証
└── __tests__/             # テストコード
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

# データ構造確認
npx tsx scripts/check-data.ts

# 改善内容の検証
npx tsx scripts/verify-improvements.ts
```

## 🎯 技術スタック

- **フレームワーク**: Next.js 16.0.1
- **言語**: TypeScript 5
- **UI**: React 19.2.0
- **スタイリング**: Tailwind CSS 4
- **テスト**: Jest 29.7.0 + Testing Library
- **アイコン**: Lucide React

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
