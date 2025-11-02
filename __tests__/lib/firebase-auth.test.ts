/**
 * Firebase Authentication統合のテスト
 */
import {
  signUp,
  login,
  logout,
  requestPasswordReset,
  resetPassword,
} from '@/lib/firebase/auth';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  updateProfile,
} from 'firebase/auth';
import { setDoc, getDoc } from 'firebase/firestore';

// モックの型定義
jest.mock('firebase/auth');
jest.mock('firebase/firestore');
jest.mock('@/lib/firebase/config', () => ({
  auth: {},
  db: {},
}));

const mockCreateUser = createUserWithEmailAndPassword as jest.MockedFunction<typeof createUserWithEmailAndPassword>;
const mockSignIn = signInWithEmailAndPassword as jest.MockedFunction<typeof signInWithEmailAndPassword>;
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;
const mockSendPasswordReset = sendPasswordResetEmail as jest.MockedFunction<typeof sendPasswordResetEmail>;
const mockConfirmPasswordReset = confirmPasswordReset as jest.MockedFunction<typeof confirmPasswordReset>;
const mockUpdateProfile = updateProfile as jest.MockedFunction<typeof updateProfile>;
const mockSetDoc = setDoc as jest.MockedFunction<typeof setDoc>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;

describe('Firebase Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('新規ユーザーを正常に登録できる', async () => {
      const mockUserCredential = {
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          displayName: 'Test User',
        },
      };

      mockCreateUser.mockResolvedValue(mockUserCredential as any);
      mockUpdateProfile.mockResolvedValue(undefined);
      mockSetDoc.mockResolvedValue(undefined);

      const result = await signUp({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe('test@example.com');
      expect(mockCreateUser).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      );
      expect(mockUpdateProfile).toHaveBeenCalled();
      expect(mockSetDoc).toHaveBeenCalled();
    });

    it('既存のメールアドレスでエラーを返す', async () => {
      const error = Object.assign(new Error('Email already in use'), { 
        code: 'auth/email-already-in-use' 
      });
      mockCreateUser.mockRejectedValue(error);

      const result = await signUp({
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('このメールアドレスは既に登録されています');
    });

    it('弱いパスワードでエラーを返す', async () => {
      const error = Object.assign(new Error('Weak password'), { 
        code: 'auth/weak-password' 
      });
      mockCreateUser.mockRejectedValue(error);

      const result = await signUp({
        email: 'test@example.com',
        password: '123',
        name: 'Test User',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('パスワードは6文字以上である必要があります');
    });
  });

  describe('login', () => {
    it('正常にログインできる', async () => {
      const mockUserCredential = {
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
        },
      };

      const mockUserDoc = {
        exists: () => true,
        data: () => ({
          id: 'test-uid',
          email: 'test@example.com',
          name: 'Test User',
          createdAt: '2024-01-01',
        }),
      };

      mockSignIn.mockResolvedValue(mockUserCredential as any);
      mockGetDoc.mockResolvedValue(mockUserDoc as any);

      const result = await login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(mockSignIn).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      );
    });

    it('無効な認証情報でエラーを返す', async () => {
      const error = Object.assign(new Error('Invalid credential'), { 
        code: 'auth/invalid-credential' 
      });
      mockSignIn.mockRejectedValue(error);

      const result = await login({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('メールアドレスまたはパスワードが正しくありません');
    });
  });

  describe('logout', () => {
    it('正常にログアウトできる', async () => {
      mockSignOut.mockResolvedValue(undefined);

      await expect(logout()).resolves.not.toThrow();
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe('requestPasswordReset', () => {
    it('パスワードリセットメールを送信できる', async () => {
      mockSendPasswordReset.mockResolvedValue(undefined);

      const result = await requestPasswordReset('test@example.com');

      expect(result.success).toBe(true);
      expect(mockSendPasswordReset).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com'
      );
    });

    it('無効なメールアドレスでエラーを返す', async () => {
      const error = Object.assign(new Error('Invalid email'), { 
        code: 'auth/invalid-email' 
      });
      mockSendPasswordReset.mockRejectedValue(error);

      const result = await requestPasswordReset('invalid-email');

      expect(result.success).toBe(false);
      expect(result.error).toBe('無効なメールアドレスです');
    });
  });

  describe('resetPassword', () => {
    it('パスワードをリセットできる', async () => {
      mockConfirmPasswordReset.mockResolvedValue(undefined);

      const result = await resetPassword('reset-code', 'newpassword123');

      expect(result.success).toBe(true);
      expect(mockConfirmPasswordReset).toHaveBeenCalledWith(
        expect.anything(),
        'reset-code',
        'newpassword123'
      );
    });

    it('無効なリセットコードでエラーを返す', async () => {
      const error = Object.assign(new Error('Invalid action code'), { 
        code: 'auth/invalid-action-code' 
      });
      mockConfirmPasswordReset.mockRejectedValue(error);

      const result = await resetPassword('invalid-code', 'newpassword123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('無効なリセットコードです');
    });
  });
});

