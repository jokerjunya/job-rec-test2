/**
 * Firebase Authentication統合
 * lib/firebase/auth.tsの関数を再エクスポート
 */
export {
  signUp,
  login,
  logout,
  requestPasswordReset,
  resetPassword,
  getCurrentUser,
  getCurrentUserId,
} from '@/lib/firebase/auth';

/**
 * パスワードリセットトークンの検証
 * Firebase Authenticationでは、トークンの検証はresetPassword時に行われるため、
 * この関数は常にtrueを返します（後方互換性のため）
 */
export function validateResetToken(token: string): { valid: boolean; email?: string; error?: string } {
  // Firebase Authenticationではトークンの検証はresetPassword時に行われる
  if (!token) {
    return { valid: false, error: '無効なリセットトークンです' };
  }
  return { valid: true };
}

