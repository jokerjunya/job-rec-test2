const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Next.jsアプリのパスを指定
  dir: './',
});

// Jestのカスタム設定
const customJestConfig = {
  // テスト環境の設定
  testEnvironment: 'jest-environment-jsdom',
  
  // セットアップファイル
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // モジュール名のマッピング（@/で始まるパスを解決）
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  
  // カバレッジ設定
  collectCoverageFrom: [
    'utils/**/*.{js,jsx,ts,tsx}',
    'data/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
  
  // テストファイルのパターン
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  
  // 無視するパス
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
  ],
  
  // トランスフォーム設定
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
      },
    }],
  },
};

// Next.jsの設定とマージしてエクスポート
module.exports = createJestConfig(customJestConfig);

