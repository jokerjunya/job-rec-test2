'use client';

import { Toaster } from 'react-hot-toast';

/**
 * トースト通知プロバイダー
 */
export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: 'var(--background)',
          color: 'var(--foreground)',
          border: '1px solid rgba(161, 161, 170, 0.2)',
          padding: '16px',
          borderRadius: '8px',
        },
        success: {
          iconTheme: {
            primary: '#3b82f6',
            secondary: '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
        },
      }}
    />
  );
}

