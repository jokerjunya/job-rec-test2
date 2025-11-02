# 🚀 CI/CD 自動デプロイ設定ガイド

GitHub Actionsを使って、`main`ブランチにpushすると自動的にFirebase Hostingにデプロイされる仕組みを設定します。

## ✅ 作成済みのファイル

- `.github/workflows/deploy.yml` - GitHub Actionsワークフロー

## 🔧 必要な設定（5分で完了）

### ステップ1: Firebase サービスアカウントキーを取得

1. **Firebase Console にアクセス**  
   https://console.firebase.google.com/project/job-swipe-app-2025/settings/serviceaccounts/adminsdk

2. **「新しい秘密鍵の生成」をクリック**

3. **JSONファイルがダウンロードされます**  
   このファイルの**全内容**をコピーしてください（ファイル全体をテキストエディタで開いてコピー）

### ステップ2: GitHub Secrets に設定

1. **GitHubリポジトリにアクセス**  
   https://github.com/jokerjunya/job-rec-test2/settings/secrets/actions

2. **「New repository secret」をクリック**

3. **以下のSecretsを1つずつ追加：**

#### Secret 1: Firebase サービスアカウント
- **Name:** `FIREBASE_SERVICE_ACCOUNT_JOB_SWIPE_APP_2025`
- **Value:** ステップ1でコピーしたJSONファイルの全内容を貼り付け

#### Secret 2-7: Firebase 環境変数

以下の6つのSecretsを追加：

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyAplVJ9_qUb2aMn5ZSE2d_eGnsIqijU7tQ` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `job-swipe-app-2025.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `job-swipe-app-2025` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `job-swipe-app-2025.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `36180462671` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:36180462671:web:b881d4e5acd5ee33b22e3a` |

### ステップ3: ワークフローファイルをpush

```bash
git add .github/workflows/deploy.yml
git add CI_CD_SETUP.md
git commit -m "ci: GitHub Actionsで自動デプロイを設定"
git push origin main
```

## 🎉 完了！

これで、`main`ブランチにpushするたびに自動的に以下が実行されます：

1. ✅ 依存関係のインストール
2. ✅ プロダクションビルド
3. ✅ Firebase Hostingへのデプロイ

## 📊 デプロイの確認方法

### GitHub Actions の確認
https://github.com/jokerjunya/job-rec-test2/actions

- pushするとワークフローが自動実行されます
- 緑のチェックマーク ✅ が表示されれば成功
- 赤いバツマーク ❌ が表示されたらエラーを確認

### デプロイ履歴の確認
https://console.firebase.google.com/project/job-swipe-app-2025/hosting/sites

- デプロイが成功すると履歴に表示されます
- 各デプロイのタイムスタンプとバージョンを確認できます

## 💡 使い方

### 通常の開発フロー

```bash
# ローカルで開発
npm run dev

# 変更をコミット
git add .
git commit -m "feat: 新機能を追加"

# mainブランチにpush（自動デプロイが開始）
git push origin main
```

### ブランチを使った開発フロー（推奨）

```bash
# 機能ブランチを作成
git checkout -b feature/new-feature

# 開発・コミット
git add .
git commit -m "feat: 新機能を追加"

# 機能ブランチをpush
git push origin feature/new-feature

# GitHubでPull Requestを作成
# レビュー後、mainブランチにマージ
# → 自動的にデプロイが開始！
```

## 🔍 トラブルシューティング

### デプロイが失敗する場合

1. **GitHub Actions のログを確認**  
   https://github.com/jokerjunya/job-rec-test2/actions
   - エラーメッセージを確認

2. **Secrets が正しく設定されているか確認**  
   https://github.com/jokerjunya/job-rec-test2/settings/secrets/actions
   - 7つのSecretsが全て設定されているか確認

3. **Firebase サービスアカウントの権限を確認**  
   - サービスアカウントに「Firebase Hosting 管理者」権限があるか確認

### ビルドエラーが出る場合

- ローカルで `npm run build` が成功するか確認
- 環境変数が正しく設定されているか確認

## 📚 参考リンク

- [GitHub Actions ドキュメント](https://docs.github.com/ja/actions)
- [Firebase Hosting GitHub Action](https://github.com/FirebaseExtended/action-hosting-deploy)
- [Firebase Console](https://console.firebase.google.com/project/job-swipe-app-2025)

## 🎯 今後の改善案

- [ ] プレビューデプロイ（Pull Request時に一時的なURLを生成）
- [ ] テスト自動実行（デプロイ前にテストを実行）
- [ ] Slack/Discord通知（デプロイ成功/失敗の通知）
- [ ] ステージング環境の追加

---

**自動デプロイの設定は完了です！** 🚀

質問があればお気軽にどうぞ！

