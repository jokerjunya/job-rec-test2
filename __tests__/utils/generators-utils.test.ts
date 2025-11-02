/**
 * データ生成ユーティリティ関数のテスト
 */
import {
  getRandomElement,
  randomInt,
  fisherYatesShuffle,
  getRandomElements,
} from '@/data/generators/utils';

describe('getRandomElement', () => {
  it('配列から1つの要素を返す', () => {
    const array = [1, 2, 3, 4, 5];
    const result = getRandomElement(array);
    expect(array).toContain(result);
  });

  it('配列の要素を変更しない', () => {
    const array = [1, 2, 3, 4, 5];
    const original = [...array];
    getRandomElement(array);
    expect(array).toEqual(original);
  });

  it('1要素の配列でもエラーが発生しない', () => {
    const array = [42];
    const result = getRandomElement(array);
    expect(result).toBe(42);
  });
});

describe('randomInt', () => {
  it('指定された範囲内の整数を返す', () => {
    const min = 1;
    const max = 10;
    const result = randomInt(min, max);
    expect(result).toBeGreaterThanOrEqual(min);
    expect(result).toBeLessThanOrEqual(max);
    expect(Number.isInteger(result)).toBe(true);
  });

  it('min === maxの場合、その値を返す', () => {
    const value = 5;
    const result = randomInt(value, value);
    expect(result).toBe(value);
  });

  it('負の数でも正しく動作する', () => {
    const min = -10;
    const max = -1;
    const result = randomInt(min, max);
    expect(result).toBeGreaterThanOrEqual(min);
    expect(result).toBeLessThanOrEqual(max);
  });

  it('大きな範囲でも正しく動作する', () => {
    const min = 0;
    const max = 1000;
    const result = randomInt(min, max);
    expect(result).toBeGreaterThanOrEqual(min);
    expect(result).toBeLessThanOrEqual(max);
  });
});

describe('fisherYatesShuffle', () => {
  it('配列の長さを変えない', () => {
    const array = [1, 2, 3, 4, 5];
    const shuffled = fisherYatesShuffle(array);
    expect(shuffled.length).toBe(array.length);
  });

  it('元の配列を変更しない', () => {
    const array = [1, 2, 3, 4, 5];
    const original = [...array];
    fisherYatesShuffle(array);
    expect(array).toEqual(original);
  });

  it('すべての要素を含む', () => {
    const array = [1, 2, 3, 4, 5];
    const shuffled = fisherYatesShuffle(array);
    expect(shuffled.sort()).toEqual(array.sort());
  });

  it('1要素の配列でもエラーが発生しない', () => {
    const array = [42];
    const shuffled = fisherYatesShuffle(array);
    expect(shuffled).toEqual([42]);
  });

  it('空配列でもエラーが発生しない', () => {
    const array: number[] = [];
    const shuffled = fisherYatesShuffle(array);
    expect(shuffled).toEqual([]);
  });

  it('複数回実行して異なる結果になる可能性がある', () => {
    const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const results = new Set<string>();
    
    // 複数回シャッフルして結果を記録
    for (let i = 0; i < 20; i++) {
      const shuffled = fisherYatesShuffle(array);
      results.add(JSON.stringify(shuffled));
    }
    
    // 少なくとも2つ以上の異なる結果があることを確認
    expect(results.size).toBeGreaterThan(1);
  });
});

describe('getRandomElements', () => {
  it('指定された数の要素を返す', () => {
    const array = [1, 2, 3, 4, 5];
    const count = 3;
    const result = getRandomElements(array, count);
    expect(result.length).toBe(count);
  });

  it('元の配列を変更しない', () => {
    const array = [1, 2, 3, 4, 5];
    const original = [...array];
    getRandomElements(array, 3);
    expect(array).toEqual(original);
  });

  it('すべての要素が元の配列に含まれる', () => {
    const array = [1, 2, 3, 4, 5];
    const result = getRandomElements(array, 3);
    result.forEach((element) => {
      expect(array).toContain(element);
    });
  });

  it('重複した要素を返さない', () => {
    const array = [1, 2, 3, 4, 5];
    const result = getRandomElements(array, 3);
    const uniqueResult = [...new Set(result)];
    expect(result.length).toBe(uniqueResult.length);
  });

  it('count >= array.length の場合、全要素をシャッフルして返す', () => {
    const array = [1, 2, 3, 4, 5];
    const result = getRandomElements(array, 10);
    expect(result.length).toBe(array.length);
    expect(result.sort()).toEqual(array.sort());
  });

  it('count === array.length の場合、全要素を返す', () => {
    const array = [1, 2, 3, 4, 5];
    const result = getRandomElements(array, array.length);
    expect(result.length).toBe(array.length);
    expect(result.sort()).toEqual(array.sort());
  });

  it('count が少ない場合（< array.length / 2）正しく動作する', () => {
    const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const count = 2; // < 10 / 2
    const result = getRandomElements(array, count);
    expect(result.length).toBe(count);
    
    // 重複なし
    const uniqueResult = [...new Set(result)];
    expect(result.length).toBe(uniqueResult.length);
  });

  it('count が多い場合（>= array.length / 2）正しく動作する', () => {
    const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const count = 7; // >= 10 / 2
    const result = getRandomElements(array, count);
    expect(result.length).toBe(count);
    
    // 重複なし
    const uniqueResult = [...new Set(result)];
    expect(result.length).toBe(uniqueResult.length);
  });

  it('空配列から選択する場合、空配列を返す', () => {
    const array: number[] = [];
    const result = getRandomElements(array, 3);
    expect(result).toEqual([]);
  });

  it('文字列配列でも正しく動作する', () => {
    const array = ['a', 'b', 'c', 'd', 'e'];
    const count = 3;
    const result = getRandomElements(array, count);
    expect(result.length).toBe(count);
    result.forEach((element) => {
      expect(array).toContain(element);
    });
  });

  it('オブジェクト配列でも正しく動作する', () => {
    const array = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
    const count = 3;
    const result = getRandomElements(array, count);
    expect(result.length).toBe(count);
    result.forEach((element) => {
      expect(array).toContainEqual(element);
    });
  });
});

