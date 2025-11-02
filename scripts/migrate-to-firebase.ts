/**
 * Firebaseマイグレーションスクリプト
 * 既存のダミーデータをFirestoreに投入
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { enhancedJobs } from '../data/jobs';

// Firebase Admin SDKの初期化
// Note: 実行前に環境変数GOOGLE_APPLICATION_CREDENTIALSにサービスアカウントキーのパスを設定してください
if (getApps().length === 0) {
  initializeApp({
    credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS || ''),
  });
}

const db = getFirestore();

/**
 * 求人データをFirestoreに移行
 */
async function migrateJobs() {
  console.log('Starting job migration...');
  console.log(`Total jobs to migrate: ${enhancedJobs.length}`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const job of enhancedJobs) {
    try {
      const jobRef = db.collection('jobs').doc(job.id);
      const jobDoc = await jobRef.get();

      if (jobDoc.exists) {
        console.log(`Job ${job.id} already exists, skipping...`);
        skipCount++;
        continue;
      }

      await jobRef.set({
        ...job,
        isDummy: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      successCount++;
      console.log(`✓ Migrated job ${job.id}: ${job.title}`);
    } catch (error) {
      errorCount++;
      console.error(`✗ Failed to migrate job ${job.id}:`, error);
    }
  }

  console.log('\n=== Job Migration Summary ===');
  console.log(`Success: ${successCount}`);
  console.log(`Skipped: ${skipCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Total: ${enhancedJobs.length}`);
}

/**
 * Firestoreインデックスの作成を提案
 */
function suggestIndexes() {
  console.log('\n=== Recommended Firestore Indexes ===');
  console.log('Please create the following indexes in Firebase Console:');
  console.log('\n1. Collection: feedbacks');
  console.log('   - userId (Ascending)');
  console.log('   - timestamp (Descending)');
  console.log('\n2. Collection: jobs');
  console.log('   - isDummy (Ascending)');
  console.log('   - postedDate (Descending)');
  console.log('\nThese indexes will improve query performance.');
}

/**
 * メイン実行関数
 */
async function main() {
  try {
    console.log('=== Firebase Migration Script ===\n');
    
    // 求人データの移行
    await migrateJobs();
    
    // インデックス作成の提案
    suggestIndexes();
    
    console.log('\n=== Migration Completed ===');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// スクリプト実行
main()
  .then(() => {
    console.log('\nExiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });

