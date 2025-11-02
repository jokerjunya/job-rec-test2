/**
 * ユーザープロファイル生成のテスト
 */
import { generateUserProfile, generateUserProfiles } from '@/data/generators/user-profiles';

describe('user-profiles generator', () => {
  describe('generateUserProfile', () => {
    it('有効なユーザープロファイルを生成する', () => {
      const profile = generateUserProfile('test_001');
      
      expect(profile.id).toBe('test_001');
      expect(profile.name).toBeDefined();
      expect(profile.name.length).toBeGreaterThan(0);
      
      // 経験レベル
      expect(['junior', 'mid', 'senior', 'expert']).toContain(profile.experienceLevel);
      
      // 経験年数が適切な範囲内か
      expect(profile.yearsOfExperience).toBeGreaterThanOrEqual(0);
      expect(profile.yearsOfExperience).toBeLessThanOrEqual(20);
      
      // 興味分野が1-3個
      expect(profile.interestAreas.length).toBeGreaterThanOrEqual(1);
      expect(profile.interestAreas.length).toBeLessThanOrEqual(3);
      
      // スキルが設定されている
      expect(profile.skills.length).toBeGreaterThan(0);
      
      // 給与期待値が正常
      expect(profile.salaryExpectationMin).toBeGreaterThan(0);
      expect(profile.salaryExpectationMax).toBeGreaterThan(profile.salaryExpectationMin);
      
      // 重要度スコアが0-1の範囲内
      expect(profile.remoteWorkImportance).toBeGreaterThanOrEqual(0);
      expect(profile.remoteWorkImportance).toBeLessThanOrEqual(1);
      expect(profile.workLifeBalanceImportance).toBeGreaterThanOrEqual(0);
      expect(profile.workLifeBalanceImportance).toBeLessThanOrEqual(1);
      expect(profile.growthOpportunityImportance).toBeGreaterThanOrEqual(0);
      expect(profile.growthOpportunityImportance).toBeLessThanOrEqual(1);
      expect(profile.benefitsImportance).toBeGreaterThanOrEqual(0);
      expect(profile.benefitsImportance).toBeLessThanOrEqual(1);
      
      // タイムスタンプが有効
      expect(new Date(profile.createdAt).getTime()).toBeLessThanOrEqual(Date.now());
    });
    
    it('経験レベルに応じた経験年数が生成される', () => {
      // 複数回生成して範囲をテスト
      for (let i = 0; i < 10; i++) {
        const profile = generateUserProfile(`test_${i}`);
        
        switch (profile.experienceLevel) {
          case 'junior':
            expect(profile.yearsOfExperience).toBeLessThanOrEqual(2);
            break;
          case 'mid':
            expect(profile.yearsOfExperience).toBeGreaterThanOrEqual(2);
            expect(profile.yearsOfExperience).toBeLessThanOrEqual(5);
            break;
          case 'senior':
            expect(profile.yearsOfExperience).toBeGreaterThanOrEqual(5);
            expect(profile.yearsOfExperience).toBeLessThanOrEqual(10);
            break;
          case 'expert':
            expect(profile.yearsOfExperience).toBeGreaterThanOrEqual(10);
            expect(profile.yearsOfExperience).toBeLessThanOrEqual(20);
            break;
        }
      }
    });
  });
  
  describe('generateUserProfiles', () => {
    it('指定した数のプロファイルを生成する', () => {
      const count = 10;
      const profiles = generateUserProfiles(count);
      
      expect(profiles.length).toBe(count);
    });
    
    it('各プロファイルが一意のIDを持つ', () => {
      const profiles = generateUserProfiles(20);
      const ids = profiles.map((p) => p.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(profiles.length);
    });
    
    it('IDが連番でフォーマットされる', () => {
      const profiles = generateUserProfiles(5);
      
      expect(profiles[0].id).toBe('user_001');
      expect(profiles[1].id).toBe('user_002');
      expect(profiles[4].id).toBe('user_005');
    });
    
    it('多様な経験レベルが生成される', () => {
      const profiles = generateUserProfiles(50);
      const levels = profiles.map((p) => p.experienceLevel);
      const uniqueLevels = new Set(levels);
      
      // 50人生成すれば、すべての経験レベルが含まれるはず
      expect(uniqueLevels.size).toBeGreaterThan(2);
    });
  });
});

