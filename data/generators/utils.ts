/**
 * データ生成の共通ユーティリティ関数
 */

/**
 * ランダムな要素を配列から取得
 */
export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * ランダムな数値を生成（min以上max以下）
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Fisher-Yatesシャッフルアルゴリズム
 * 偏りのない均等な確率でシャッフルを行う
 * 
 * @param array - シャッフルする配列
 * @returns シャッフルされた新しい配列
 */
export function fisherYatesShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 配列からランダムにn個の要素を選択（最適化版）
 * 
 * パフォーマンス特性:
 * - count < array.length / 2 の場合: O(n) - 重複チェック方式
 * - count >= array.length / 2 の場合: O(n log n) - シャッフル方式
 * - count >= array.length の場合: 全要素をシャッフルして返す
 * 
 * @param array - 元となる配列
 * @param count - 選択する要素数
 * @returns ランダムに選択された要素の配列
 */
export function getRandomElements<T>(array: T[], count: number): T[] {
  // 要素数が配列の長さ以上の場合、全要素をシャッフルして返す
  if (count >= array.length) {
    return fisherYatesShuffle(array);
  }
  
  // 少数の要素を選択する場合は重複チェック方式（効率的）
  if (count < array.length / 2) {
    const selected = new Set<number>();
    const result: T[] = [];
    
    while (result.length < count) {
      const index = Math.floor(Math.random() * array.length);
      if (!selected.has(index)) {
        selected.add(index);
        result.push(array[index]);
      }
    }
    
    return result;
  }
  
  // 多数の要素を選択する場合はシャッフルしてスライス
  return fisherYatesShuffle(array).slice(0, count);
}

