This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

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
