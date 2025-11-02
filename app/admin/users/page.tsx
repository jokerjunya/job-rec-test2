'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';

/**
 * ユーザー情報とパスワードの型定義
 */
interface UserWithPassword {
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
  };
  password: string;
}

/**
 * 管理画面: ユーザー一覧ページ
 */
export default function UsersAdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserWithPassword[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'date'>('date');

  useEffect(() => {
    // 認証チェック（本来は管理者権限チェックも必要）
    if (!authLoading && !user) {
      router.push('/');
      return;
    }

    // localStorageからユーザーデータを取得
    try {
      const data = localStorage.getItem('job-app-users');
      if (data) {
        const parsedUsers = JSON.parse(data) as UserWithPassword[];
        setUsers(parsedUsers);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  }, [authLoading, user, router]);

  // フィルタリング
  const filteredUsers = users.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.user.name.toLowerCase().includes(searchLower) ||
      item.user.email.toLowerCase().includes(searchLower) ||
      item.user.id.toLowerCase().includes(searchLower)
    );
  });

  // ソート
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.user.name.localeCompare(b.user.name);
      case 'email':
        return a.user.email.localeCompare(b.user.email);
      case 'date':
        return new Date(b.user.createdAt).getTime() - new Date(a.user.createdAt).getTime();
      default:
        return 0;
    }
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* ヘッダー */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2 transition-colors"
          >
            ← ホームに戻る
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            👥 ユーザー管理画面
          </h1>
          <p className="text-gray-600">
            登録ユーザー数: <span className="font-semibold text-blue-600">{users.length}人</span>
          </p>
        </div>

        {/* フィルター・ソートコントロール */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 検索 */}
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                🔍 検索
              </label>
              <input
                id="search"
                type="text"
                placeholder="名前、メール、IDで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* ソート */}
            <div className="md:w-48">
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                📊 並び替え
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'email' | 'date')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">登録日時（新しい順）</option>
                <option value="name">名前（昇順）</option>
                <option value="email">メール（昇順）</option>
              </select>
            </div>
          </div>

          {searchTerm && (
            <p className="mt-4 text-sm text-gray-600">
              検索結果: {filteredUsers.length}件
            </p>
          )}
        </div>

        {/* ユーザー一覧 */}
        {sortedUsers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">
              {searchTerm ? '該当するユーザーが見つかりません' : 'ユーザーが登録されていません'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedUsers.map((item, index) => (
              <div
                key={item.user.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-blue-200"
              >
                {/* カードヘッダー */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">
                      #{index + 1}
                    </span>
                    {item.user.id === user?.id && (
                      <span className="bg-yellow-400 text-yellow-900 text-xs px-3 py-1 rounded-full font-semibold">
                        現在のユーザー
                      </span>
                    )}
                  </div>
                </div>

                {/* カードボディ */}
                <div className="p-6 space-y-4">
                  {/* 名前 */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">名前</p>
                    <p className="text-lg font-bold text-gray-800">{item.user.name}</p>
                  </div>

                  {/* メールアドレス */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">メールアドレス</p>
                    <p className="text-sm text-gray-700 break-all">{item.user.email}</p>
                  </div>

                  {/* パスワード */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">パスワード</p>
                    <p className="text-sm font-mono bg-gray-100 px-3 py-2 rounded border border-gray-200">
                      {item.password}
                    </p>
                  </div>

                  {/* ユーザーID */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">ユーザーID</p>
                    <p className="text-xs font-mono text-gray-600 break-all">{item.user.id}</p>
                  </div>

                  {/* 登録日時 */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">登録日時</p>
                    <p className="text-sm text-gray-700">
                      {new Date(item.user.createdAt).toLocaleString('ja-JP', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* セキュリティ警告 */}
        <div className="mt-8 bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
          <div className="flex items-start">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <h3 className="font-bold text-red-800 mb-2">セキュリティ警告</h3>
              <p className="text-sm text-red-700 leading-relaxed">
                この画面はデモ目的です。本番環境では以下の対策が必須です：
              </p>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                <li>パスワードのハッシュ化（bcrypt等）</li>
                <li>管理者権限による適切なアクセス制御</li>
                <li>HTTPS通信の使用</li>
                <li>バックエンドAPIでの認証処理</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

