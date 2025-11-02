# Firebase移行ガイド

## 移行概要

このドキュメントは、LocalStorageベースの認証・データ管理からFirebase Authentication + Firestoreへの移行に関する情報をまとめています。

## 実装済み機能

### ✅ 1. Firebase設定

#### パッケージ
- `firebase` (v12.5.0) - クライアントSDK
- `firebase-admin` (v13.5.0) - サーバーサイドSDK（マイグレーション用）

#### 設定ファイル
- `lib/firebase/config.ts` - Firebase初期化
- `lib/firebase/auth.ts` - Authentication操作
- `lib/firebase/firestore.ts` - Firestore操作

### ✅ 2. 認証システム

#### Firebase Authentication統合
- メール/パスワード認証
- パスワードのハッシュ化（自動）
- パスワードリセット機能（メール送信）
- リアルタイム認証状態監視（`onAuthStateChanged`）

#### 移行内容
- `utils/auth.ts` - Firebase Authentication関数を再エクスポート
- `contexts/auth-context.tsx` - `onAuthStateChanged`でリアルタイム監視
- 既存のAPI互換性を維持

### ✅ 3. Firestoreデータ構造

#### コレクション
```
users/
  {userId}/
    - id: string
    - email: string
    - name: string
    - createdAt: timestamp

jobs/
  {jobId}/
    - (Job型のすべてのフィールド)
    - isDummy: boolean
    - createdAt: timestamp
    - updatedAt: timestamp

feedbacks/
  {userId}_{jobId}/
    - userId: string
    - jobId: string
    - feedback: 'like' | 'dislike'
    - timestamp: timestamp

userProfiles/
  {userId}/
    - (UserProfile型のすべてのフィールド)
    - updatedAt: timestamp
```

#### インデックス（推奨）
1. `feedbacks` コレクション
   - userId (Ascending) + timestamp (Descending)

2. `jobs` コレクション
   - isDummy (Ascending) + postedDate (Descending)

### ✅ 4. データ操作の移行

#### 変更されたユーティリティ
- `utils/local-storage.ts` - Firestore操作を再エクスポート（非同期化）
- `utils/jobs.ts` - 新規作成（Firestoreと静的データの統合）
- `hooks/use-job-feedback.ts` - 非同期対応

#### UIコンポーネント
- `app/page.tsx` - 求人データの非同期取得
- `app/recommendations/page.tsx` - フィードバックデータの非同期取得
- すべてのコンポーネントがFirebase統合に対応

### ✅ 5. セキュリティルール

#### Firestoreセキュリティルール（`firestore.rules`）
- ユーザーは自分のデータのみアクセス可能
- 求人情報は認証済みユーザーのみ閲覧可能
- フィードバックは作成者のみ変更・削除可能

### ✅ 6. マイグレーションスクリプト

#### `scripts/migrate-to-firebase.ts`
- 既存のダミーデータをFirestoreに投入
- `isDummy: true`フラグを自動付与
- 重複チェック機能

#### 実行方法
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
npm run migrate:firebase
```

### ✅ 7. テスト

#### テストカバレッジ
- 107個のテスト（105個パス）
- Firebase Authentication統合のテスト
- Firestore操作のテスト
- すべてのモック実装

#### jest.setup.js
- Firebaseのモック設定
- テスト環境の初期化

## セットアップ手順

### 1. Firebaseプロジェクト作成
1. [Firebase Console](https://console.firebase.google.com/)でプロジェクトを作成
2. Authentication > メール/パスワード認証を有効化
3. Firestore Database を作成（テストモードで開始）

### 2. 環境変数設定
`.env.local`ファイルを作成：

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 3. Firebase CLIセットアップ
```bash
npm install -g firebase-tools
firebase login
firebase init firestore
```

### 4. セキュリティルールのデプロイ
```bash
firebase deploy --only firestore:rules
```

### 5. ダミーデータのマイグレーション（オプション）
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
npm run migrate:firebase
```

### 6. アプリの起動
```bash
npm install
npm run dev
```

## 移行のメリット

### セキュリティ
- Firebase Authenticationによる安全な認証
- パスワードのハッシュ化（自動）
- Firestoreセキュリティルールによるデータ保護

### スケーラビリティ
- LocalStorageの制限（5-10MB）を超えるデータ管理
- 複数デバイスでのデータ同期
- クラウドベースのインフラ

### 機能
- パスワードリセットのメール送信（標準機能）
- リアルタイムデータ同期（オプション）
- オフライン対応（オプション）

## 今後の拡張

### 推奨される改善
1. **Firebase Cloud Functions**
   - サーバーサイドロジックの実装
   - 定期的なデータクリーンアップ
   - レコメンデーションの事前計算

2. **Firebase Hosting**
   - 静的ファイルのホスティング
   - CDN配信
   - カスタムドメイン

3. **Firebase Analytics**
   - ユーザー行動の分析
   - A/Bテスト
   - クラッシュレポート

4. **Firestore クエリの最適化**
   - 複合インデックスの追加
   - クエリのキャッシング
   - ページネーション

5. **リアルタイム機能**
   - Firestoreリアルタイムリスナー
   - 新着求人の通知
   - フィードバックのリアルタイム更新

## トラブルシューティング

### よくある問題

#### 1. Firebase初期化エラー
**エラー**: "Firebase: No Firebase App '[DEFAULT]' has been created"
**解決**: `.env.local`の環境変数が正しく設定されているか確認

#### 2. Firestoreアクセス権限エラー
**エラー**: "Missing or insufficient permissions"
**解決**: セキュリティルールをデプロイしたか確認、認証状態を確認

#### 3. テストエラー
**エラー**: Firebaseモックが動作しない
**解決**: `jest.setup.js`のモック設定を確認

## 参考資料

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Next.js with Firebase](https://firebase.google.com/docs/hosting/frameworks/nextjs)

## 移行完了チェックリスト

- [x] Firebaseパッケージのインストール
- [x] Firebase設定ファイルの作成
- [x] 認証システムの移行
- [x] Firestoreデータ操作の実装
- [x] UIコンポーネントの更新
- [x] セキュリティルールの設定
- [x] マイグレーションスクリプトの作成
- [x] テストの更新
- [x] READMEの更新
- [ ] 本番環境へのデプロイ
- [ ] ユーザー通知とドキュメント

## 連絡先

質問や問題がある場合は、プロジェクトのIssueトラッカーまたは開発チームに連絡してください。

