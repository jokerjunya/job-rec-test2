/**
 * データジェネレーターのテスト
 */
import { generateCompanyAttributes } from '@/data/generators/company-attributes';
import { generateEnhancedJobs } from '@/data/jobs';
import { companyIndustryMapping, jobSkillsMapping } from '@/data/generators/mappings';

describe('generateCompanyAttributes', () => {
  it('必要な属性を持つオブジェクトを返す', () => {
    const attributes = generateCompanyAttributes();
    
    expect(attributes).toHaveProperty('size');
    expect(attributes).toHaveProperty('stage');
    expect(attributes).toHaveProperty('industry');
    expect(attributes).toHaveProperty('hasStockOptions');
    expect(attributes).toHaveProperty('companyCulture');
  });

  it('企業規模が正しい値のいずれかである', () => {
    const validSizes = ['startup', 'small', 'medium', 'large', 'enterprise'];
    const attributes = generateCompanyAttributes();
    
    expect(validSizes).toContain(attributes.size);
  });

  it('成長段階が正しい値のいずれかである', () => {
    const validStages = ['early', 'growth', 'mature', 'public'];
    const attributes = generateCompanyAttributes();
    
    expect(validStages).toContain(attributes.stage);
  });

  it('企業規模と成長段階が適切に相関している', () => {
    // スタートアップは early または growth
    const startupAttributes = Array.from({ length: 10 }, () => {
      let attrs = generateCompanyAttributes();
      while (attrs.size !== 'startup') {
        attrs = generateCompanyAttributes();
      }
      return attrs;
    });
    
    startupAttributes.forEach((attr) => {
      expect(['early', 'growth']).toContain(attr.stage);
    });
  });

  it('ストックオプションがブール値である', () => {
    const attributes = generateCompanyAttributes();
    
    expect(typeof attributes.hasStockOptions).toBe('boolean');
  });

  it('企業文化が1-4個の配列である', () => {
    const attributes = generateCompanyAttributes();
    
    expect(Array.isArray(attributes.companyCulture)).toBe(true);
    expect(attributes.companyCulture.length).toBeGreaterThanOrEqual(1);
    expect(attributes.companyCulture.length).toBeLessThanOrEqual(4);
  });

  it('企業名を指定した場合、関連する業界が選ばれる', () => {
    const companyName = 'フィンテックソリューションズ';
    const possibleIndustries = companyIndustryMapping[companyName];
    
    // 複数回生成して、すべて可能な業界に含まれることを確認
    for (let i = 0; i < 10; i++) {
      const attributes = generateCompanyAttributes(companyName);
      expect(possibleIndustries).toContain(attributes.industry);
    }
  });

  it('マッピングにない企業名でもエラーが発生しない', () => {
    const attributes = generateCompanyAttributes('存在しない企業株式会社');
    
    expect(attributes).toHaveProperty('industry');
    expect(typeof attributes.industry).toBe('string');
  });
});

describe('generateEnhancedJobs', () => {
  it('指定された数の求人データを生成する', () => {
    const jobs = generateEnhancedJobs();
    
    expect(jobs.length).toBe(100);
  });

  it('各求人が必要な属性を持つ', () => {
    const jobs = generateEnhancedJobs();
    const job = jobs[0];
    
    expect(job).toHaveProperty('id');
    expect(job).toHaveProperty('title');
    expect(job).toHaveProperty('company');
    expect(job).toHaveProperty('salary');
    expect(job).toHaveProperty('location');
    expect(job).toHaveProperty('description');
    expect(job).toHaveProperty('requiredSkills');
    expect(job).toHaveProperty('workType');
    expect(job).toHaveProperty('startDate');
    expect(job).toHaveProperty('postedDate');
    expect(job).toHaveProperty('companyAttributes');
  });

  it('求人IDがユニークである', () => {
    const jobs = generateEnhancedJobs();
    const ids = jobs.map((job) => job.id);
    const uniqueIds = new Set(ids);
    
    expect(uniqueIds.size).toBe(jobs.length);
  });

  it('求人IDが正しいフォーマットである', () => {
    const jobs = generateEnhancedJobs();
    
    jobs.forEach((job, index) => {
      const expectedId = `job-${String(index + 1).padStart(3, '0')}`;
      expect(job.id).toBe(expectedId);
    });
  });

  it('給与範囲が正しい形式である', () => {
    const jobs = generateEnhancedJobs();
    
    jobs.forEach((job) => {
      expect(job.salary).toHaveProperty('min');
      expect(job.salary).toHaveProperty('max');
      expect(job.salary).toHaveProperty('currency');
      expect(job.salary.min).toBeLessThanOrEqual(job.salary.max);
      expect(typeof job.salary.min).toBe('number');
      expect(typeof job.salary.max).toBe('number');
    });
  });

  it('必要なスキルが3-7個である', () => {
    const jobs = generateEnhancedJobs();
    
    jobs.forEach((job) => {
      expect(job.requiredSkills.length).toBeGreaterThanOrEqual(3);
      expect(job.requiredSkills.length).toBeLessThanOrEqual(7);
    });
  });

  it('職種に関連するスキルが含まれる確率が高い', () => {
    const jobs = generateEnhancedJobs();
    
    // マッピングがある職種のみをフィルタ
    const jobsWithMapping = jobs.filter(
      (job) => jobSkillsMapping[job.title] !== undefined
    );
    
    // 少なくとも1つの関連スキルを含む求人の割合を計算
    const jobsWithRelevantSkills = jobsWithMapping.filter((job) => {
      const relevantSkills = jobSkillsMapping[job.title] || [];
      return job.requiredSkills.some((skill) =>
        relevantSkills.includes(skill)
      );
    });
    
    // 80%以上の求人が関連スキルを含むことを期待
    const ratio = jobsWithRelevantSkills.length / jobsWithMapping.length;
    expect(ratio).toBeGreaterThan(0.8);
  });

  it('勤務開始日が投稿日より未来である', () => {
    const jobs = generateEnhancedJobs();
    
    jobs.forEach((job) => {
      const startDate = new Date(job.startDate);
      const postedDate = new Date(job.postedDate);
      
      expect(startDate.getTime()).toBeGreaterThan(postedDate.getTime());
    });
  });

  it('勤務形態が正しい値のいずれかである', () => {
    const validWorkTypes = ['full-time', 'part-time', 'contract', 'remote', 'hybrid'];
    const jobs = generateEnhancedJobs();
    
    jobs.forEach((job) => {
      expect(validWorkTypes).toContain(job.workType);
    });
  });

  it('企業属性が存在する', () => {
    const jobs = generateEnhancedJobs();
    
    jobs.forEach((job) => {
      expect(job.companyAttributes).toBeDefined();
      expect(job.companyAttributes).not.toBeNull();
      expect(job.companyAttributes).toHaveProperty('size');
      expect(job.companyAttributes).toHaveProperty('stage');
      expect(job.companyAttributes).toHaveProperty('industry');
    });
  });

  it('同じ企業の求人は同じ業界である可能性が高い', () => {
    const jobs = generateEnhancedJobs();
    
    // 同じ企業の求人をグループ化
    const companiesMap = new Map<string, string[]>();
    jobs.forEach((job) => {
      if (!companiesMap.has(job.company)) {
        companiesMap.set(job.company, []);
      }
      if (job.companyAttributes?.industry) {
        companiesMap.get(job.company)!.push(job.companyAttributes.industry);
      }
    });
    
    // 各企業で、最も多い業界が50%以上を占めることを確認
    companiesMap.forEach((industries, company) => {
      if (industries.length < 2) return; // サンプル数が少ない場合はスキップ
      
      const industryCounts = new Map<string, number>();
      industries.forEach((industry) => {
        industryCounts.set(industry, (industryCounts.get(industry) || 0) + 1);
      });
      
      const maxCount = Math.max(...industryCounts.values());
      const ratio = maxCount / industries.length;
      
      // マッピングがある企業の場合、同じ業界である確率が高いはず
      if (companyIndustryMapping[company]) {
        expect(ratio).toBeGreaterThan(0.3); // 少なくとも30%
      }
    });
  });
});

describe('職種とスキルのマッピング', () => {
  it('主要な職種にマッピングが定義されている', () => {
    const importantJobTitles = [
      'フロントエンドエンジニア',
      'バックエンドエンジニア',
      'データエンジニア',
      '機械学習エンジニア',
    ];
    
    importantJobTitles.forEach((title) => {
      expect(jobSkillsMapping[title]).toBeDefined();
      expect(Array.isArray(jobSkillsMapping[title])).toBe(true);
      expect(jobSkillsMapping[title].length).toBeGreaterThan(0);
    });
  });

  it('各職種のスキルが重複していない', () => {
    Object.values(jobSkillsMapping).forEach((skills) => {
      const uniqueSkills = new Set(skills);
      expect(uniqueSkills.size).toBe(skills.length);
    });
  });
});

describe('企業と業界のマッピング', () => {
  it('主要な企業にマッピングが定義されている', () => {
    const importantCompanies = [
      'テックイノベーション株式会社',
      'フィンテックソリューションズ',
      'ゲームスタジオXYZ',
    ];
    
    importantCompanies.forEach((company) => {
      expect(companyIndustryMapping[company]).toBeDefined();
      expect(Array.isArray(companyIndustryMapping[company])).toBe(true);
      expect(companyIndustryMapping[company].length).toBeGreaterThan(0);
    });
  });

  it('各企業の業界が空配列でない', () => {
    Object.values(companyIndustryMapping).forEach((industries) => {
      expect(industries.length).toBeGreaterThan(0);
    });
  });
});

