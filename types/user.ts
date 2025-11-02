/**
 * ユーザー情報の型定義
 */
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

/**
 * ログイン情報の型定義
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * 新規登録情報の型定義
 */
export interface SignUpCredentials {
  email: string;
  password: string;
  name: string;
}

