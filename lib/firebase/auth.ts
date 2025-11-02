import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  User as FirebaseUser,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import type { User, LoginCredentials, SignUpCredentials } from '@/types/user';

/**
 * Firebase Userを内部User型に変換
 */
export function convertFirebaseUser(firebaseUser: FirebaseUser): User {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: firebaseUser.displayName || '',
    createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
  };
}

/**
 * Firestoreからユーザー情報を取得
 */
export async function getUserFromFirestore(uid: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    return null;
  } catch (error) {
    console.error('Failed to get user from Firestore:', error);
    return null;
  }
}

/**
 * 新規ユーザー登録
 */
export async function signUp(
  credentials: SignUpCredentials
): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    // Firebase Authenticationでユーザー作成
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );

    // プロフィールに名前を設定
    await updateProfile(userCredential.user, {
      displayName: credentials.name,
    });

    // Firestoreにユーザー情報を保存
    const user: User = {
      id: userCredential.user.uid,
      email: credentials.email,
      name: credentials.name,
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', user.id), {
      ...user,
      createdAt: serverTimestamp(),
    });

    return { success: true, user };
  } catch (error: unknown) {
    console.error('Sign up error:', error);
    
    if (error instanceof Error) {
      // Firebase固有のエラーコードを処理
      const errorCode = (error as { code?: string }).code;
      
      switch (errorCode) {
        case 'auth/email-already-in-use':
          return { success: false, error: 'このメールアドレスは既に登録されています' };
        case 'auth/invalid-email':
          return { success: false, error: '無効なメールアドレスです' };
        case 'auth/weak-password':
          return { success: false, error: 'パスワードは6文字以上である必要があります' };
        default:
          return { success: false, error: 'アカウント作成に失敗しました' };
      }
    }
    
    return { success: false, error: 'アカウント作成に失敗しました' };
  }
}

/**
 * ログイン
 */
export async function login(
  credentials: LoginCredentials
): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );

    // Firestoreからユーザー情報を取得
    const user = await getUserFromFirestore(userCredential.user.uid);
    
    if (!user) {
      return { success: false, error: 'ユーザー情報の取得に失敗しました' };
    }

    return { success: true, user };
  } catch (error: unknown) {
    console.error('Login error:', error);
    
    if (error instanceof Error) {
      const errorCode = (error as { code?: string }).code;
      
      switch (errorCode) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          return { success: false, error: 'メールアドレスまたはパスワードが正しくありません' };
        case 'auth/invalid-email':
          return { success: false, error: '無効なメールアドレスです' };
        case 'auth/user-disabled':
          return { success: false, error: 'このアカウントは無効化されています' };
        default:
          return { success: false, error: 'ログインに失敗しました' };
      }
    }
    
    return { success: false, error: 'ログインに失敗しました' };
  }
}

/**
 * Googleアカウントでログイン
 */
export async function loginWithGoogle(): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    const provider = new GoogleAuthProvider();
    // Google アカウントの選択を強制
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    const userCredential = await signInWithPopup(auth, provider);

    // Firestoreからユーザー情報を取得
    let user = await getUserFromFirestore(userCredential.user.uid);
    
    // 新規ユーザーの場合、Firestoreに保存
    if (!user) {
      user = {
        id: userCredential.user.uid,
        email: userCredential.user.email || '',
        name: userCredential.user.displayName || '',
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', user.id), {
        ...user,
        createdAt: serverTimestamp(),
      });
    }

    return { success: true, user };
  } catch (error: unknown) {
    console.error('Google login error:', error);
    
    if (error instanceof Error) {
      const errorCode = (error as { code?: string }).code;
      
      switch (errorCode) {
        case 'auth/popup-closed-by-user':
          return { success: false, error: 'ログインがキャンセルされました' };
        case 'auth/popup-blocked':
          return { success: false, error: 'ポップアップがブロックされました。ポップアップを許可してください' };
        case 'auth/cancelled-popup-request':
          return { success: false, error: 'ログインがキャンセルされました' };
        case 'auth/account-exists-with-different-credential':
          return { success: false, error: 'このメールアドレスは別の方法で登録されています' };
        default:
          return { success: false, error: 'Googleログインに失敗しました' };
      }
    }
    
    return { success: false, error: 'Googleログインに失敗しました' };
  }
}

/**
 * ログアウト
 */
export async function logout(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

/**
 * パスワードリセットメールを送信
 */
export async function requestPasswordReset(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: unknown) {
    console.error('Password reset request error:', error);
    
    if (error instanceof Error) {
      const errorCode = (error as { code?: string }).code;
      
      switch (errorCode) {
        case 'auth/user-not-found':
          // セキュリティのため、ユーザーが存在しない場合でも成功を返す
          return { success: true };
        case 'auth/invalid-email':
          return { success: false, error: '無効なメールアドレスです' };
        default:
          return { success: false, error: 'パスワードリセットメールの送信に失敗しました' };
      }
    }
    
    return { success: false, error: 'パスワードリセットメールの送信に失敗しました' };
  }
}

/**
 * パスワードをリセット
 */
export async function resetPassword(
  code: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await confirmPasswordReset(auth, code, newPassword);
    return { success: true };
  } catch (error: unknown) {
    console.error('Password reset error:', error);
    
    if (error instanceof Error) {
      const errorCode = (error as { code?: string }).code;
      
      switch (errorCode) {
        case 'auth/expired-action-code':
          return { success: false, error: 'リセットコードの有効期限が切れています' };
        case 'auth/invalid-action-code':
          return { success: false, error: '無効なリセットコードです' };
        case 'auth/weak-password':
          return { success: false, error: 'パスワードは6文字以上である必要があります' };
        default:
          return { success: false, error: 'パスワードのリセットに失敗しました' };
      }
    }
    
    return { success: false, error: 'パスワードのリセットに失敗しました' };
  }
}

/**
 * 現在のユーザーを取得
 */
export function getCurrentUser(): User | null {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) {
    return null;
  }
  return convertFirebaseUser(firebaseUser);
}

/**
 * 現在のユーザーIDを取得
 */
export function getCurrentUserId(): string | null {
  return auth.currentUser?.uid || null;
}

