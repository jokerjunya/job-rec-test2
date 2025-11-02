import type { User, LoginCredentials, SignUpCredentials } from '@/types/user';

/**
 * localStorage操作のキー
 */
const USERS_STORAGE_KEY = 'job-app-users';
const CURRENT_USER_KEY = 'job-app-current-user';
const RESET_TOKENS_KEY = 'job-app-reset-tokens';

/**
 * パスワードリセットトークンの型定義
 */
interface ResetToken {
  email: string;
  token: string;
  expiresAt: number; // タイムスタンプ（ミリ秒）
}

/**
 * localStorageが利用可能かチェック
 */
function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * ユーザー情報とパスワードのマッピング
 */
interface UserWithPassword {
  user: User;
  password: string;
}

/**
 * すべてのユーザーを取得
 */
function getAllUsers(): UserWithPassword[] {
  if (!isStorageAvailable()) {
    return [];
  }

  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    if (!data) {
      return [];
    }
    return JSON.parse(data) as UserWithPassword[];
  } catch {
    return [];
  }
}

/**
 * ユーザーを保存
 */
function saveUsers(users: UserWithPassword[]): void {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Failed to save users:', error);
  }
}

/**
 * 現在のユーザーIDを取得
 */
export function getCurrentUserId(): string | null {
  if (!isStorageAvailable()) {
    return null;
  }

  try {
    return localStorage.getItem(CURRENT_USER_KEY);
  } catch {
    return null;
  }
}

/**
 * 現在のユーザー情報を取得
 */
export function getCurrentUser(): User | null {
  const userId = getCurrentUserId();
  if (!userId) {
    return null;
  }

  const users = getAllUsers();
  const userWithPassword = users.find((u) => u.user.id === userId);
  return userWithPassword ? userWithPassword.user : null;
}

/**
 * 現在のユーザーを設定
 */
export function setCurrentUser(userId: string | null): void {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    if (userId) {
      localStorage.setItem(CURRENT_USER_KEY, userId);
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (error) {
    console.error('Failed to set current user:', error);
  }
}

/**
 * 新規ユーザー登録
 */
export function signUp(credentials: SignUpCredentials): { success: boolean; error?: string; user?: User } {
  const users = getAllUsers();

  // 既存ユーザーチェック
  if (users.some((u) => u.user.email === credentials.email)) {
    return { success: false, error: 'このメールアドレスは既に登録されています' };
  }

  // パスワード検証（最低6文字）
  if (credentials.password.length < 6) {
    return { success: false, error: 'パスワードは6文字以上である必要があります' };
  }

  const newUser: User = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email: credentials.email,
    name: credentials.name,
    createdAt: new Date().toISOString(),
  };

  users.push({
    user: newUser,
    password: credentials.password, // 実際のアプリではハッシュ化すべき
  });

  saveUsers(users);
  setCurrentUser(newUser.id);

  return { success: true, user: newUser };
}

/**
 * ログイン
 */
export function login(credentials: LoginCredentials): { success: boolean; error?: string; user?: User } {
  const users = getAllUsers();
  const userWithPassword = users.find((u) => u.user.email === credentials.email);

  if (!userWithPassword) {
    return { success: false, error: 'メールアドレスまたはパスワードが正しくありません' };
  }

  if (userWithPassword.password !== credentials.password) {
    return { success: false, error: 'メールアドレスまたはパスワードが正しくありません' };
  }

  setCurrentUser(userWithPassword.user.id);

  return { success: true, user: userWithPassword.user };
}

/**
 * ログアウト
 */
export function logout(): void {
  setCurrentUser(null);
}

/**
 * リセットトークンを取得
 */
function getResetTokens(): ResetToken[] {
  if (!isStorageAvailable()) {
    return [];
  }

  try {
    const data = localStorage.getItem(RESET_TOKENS_KEY);
    if (!data) {
      return [];
    }
    return JSON.parse(data) as ResetToken[];
  } catch {
    return [];
  }
}

/**
 * リセットトークンを保存
 */
function saveResetTokens(tokens: ResetToken[]): void {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    // 有効期限切れのトークンを削除
    const now = Date.now();
    const validTokens = tokens.filter((token) => token.expiresAt > now);
    localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(validTokens));
  } catch (error) {
    console.error('Failed to save reset tokens:', error);
  }
}

/**
 * 安全なランダムトークンを生成
 */
function generateResetToken(): string {
  const array = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    // フォールバック（本番環境では使用しない）
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * パスワードリセットリクエスト
 * メールアドレスを受け取り、リセットトークンを生成して保存
 */
export function requestPasswordReset(email: string): { success: boolean; error?: string; resetToken?: string } {
  const users = getAllUsers();
  const userWithPassword = users.find((u) => u.user.email === email);

  if (!userWithPassword) {
    // セキュリティのため、存在しないメールアドレスでも成功を返す
    return { success: true };
  }

  // リセットトークンを生成（有効期限: 1時間）
  const token = generateResetToken();
  const expiresAt = Date.now() + 60 * 60 * 1000; // 1時間後

  const resetTokens = getResetTokens();
  // 既存のトークンを削除（同じメールアドレスの場合）
  const filteredTokens = resetTokens.filter((t) => t.email !== email);
  filteredTokens.push({ email, token, expiresAt });
  saveResetTokens(filteredTokens);

  // 実際のアプリでは、ここでメールを送信します
  // 今回はデモ用にトークンを返します
  return { success: true, resetToken: token };
}

/**
 * パスワードリセット
 * トークンと新しいパスワードを受け取り、パスワードを更新
 */
export function resetPassword(token: string, newPassword: string): { success: boolean; error?: string } {
  // パスワード検証
  if (newPassword.length < 6) {
    return { success: false, error: 'パスワードは6文字以上である必要があります' };
  }

  const resetTokens = getResetTokens();
  const now = Date.now();
  const resetToken = resetTokens.find((t) => t.token === token && t.expiresAt > now);

  if (!resetToken) {
    return { success: false, error: '無効または期限切れのリセットトークンです' };
  }

  const users = getAllUsers();
  const userIndex = users.findIndex((u) => u.user.email === resetToken.email);

  if (userIndex === -1) {
    return { success: false, error: 'ユーザーが見つかりませんでした' };
  }

  // パスワードを更新
  users[userIndex].password = newPassword; // 実際のアプリではハッシュ化すべき
  saveUsers(users);

  // 使用済みトークンを削除
  const filteredTokens = resetTokens.filter((t) => t.token !== token);
  saveResetTokens(filteredTokens);

  return { success: true };
}

/**
 * リセットトークンの有効性を確認
 */
export function validateResetToken(token: string): { valid: boolean; email?: string; error?: string } {
  const resetTokens = getResetTokens();
  const now = Date.now();
  const resetToken = resetTokens.find((t) => t.token === token && t.expiresAt > now);

  if (!resetToken) {
    return { valid: false, error: '無効または期限切れのリセットトークンです' };
  }

  return { valid: true, email: resetToken.email };
}

