/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CriticalSkillsService } from 'src/team-skills/skills-matrix/critical-skills.service';
import { EmployeeSkill } from 'src/team-skills/employee-skill/employee-skill.entity';

describe('CriticalSkillsService', () => {
  let service: CriticalSkillsService;
  let cacheManager: jest.Mocked<Cache>;

  const mockSkills = [
    { id: 'skill-1', name: 'TypeScript' },
    { id: 'skill-2', name: 'React' },
    { id: 'skill-3', name: 'Python' },
  ];

  const mockAssignments: EmployeeSkill[] = [
    {
      id: 'emp-skill-1',
      employeeId: 'emp-1',
      skillId: 'skill-1',
      level: 4,
    } as EmployeeSkill,
    {
      id: 'emp-skill-2',
      employeeId: 'emp-2',
      skillId: 'skill-1',
      level: 3,
    } as EmployeeSkill,
    {
      id: 'emp-skill-3',
      employeeId: 'emp-3',
      skillId: 'skill-1',
      level: 2,
    } as EmployeeSkill,
    {
      id: 'emp-skill-4',
      employeeId: 'emp-1',
      skillId: 'skill-2',
      level: 2,
    } as EmployeeSkill,
  ];

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CriticalSkillsService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<CriticalSkillsService>(CriticalSkillsService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ------------------
  // getCriticalSkills - Caching
  // ------------------
  it('should return cached critical skills if available', async () => {
    const cachedResult = [
      {
        skillId: 'skill-1',
        skillName: 'TypeScript',
        holderCount: 3,
        expertCount: 2,
        isCritical: false,
      },
    ];

    cacheManager.get.mockResolvedValue(cachedResult);

    const result = await service.getCriticalSkills(mockSkills, mockAssignments);

    expect(result).toEqual(cachedResult);
    expect(cacheManager.get).toHaveBeenCalledTimes(1);
    expect(cacheManager.set).not.toHaveBeenCalled();
  });

  it('should compute and cache critical skills when cache is empty', async () => {
    cacheManager.get.mockResolvedValue(null);
    cacheManager.set.mockResolvedValue(undefined);

    const result = await service.getCriticalSkills(mockSkills, mockAssignments);

    expect(result).toBeDefined();
    expect(result).toHaveLength(3);
    expect(cacheManager.get).toHaveBeenCalledTimes(1);
    expect(cacheManager.set).toHaveBeenCalledTimes(1);
    expect(cacheManager.set).toHaveBeenCalledWith(
      expect.any(String),
      result,
      600,
    );
  });

  // ------------------
  // getCriticalSkills - Detection Logic
  // ------------------
  it('should correctly identify non-critical skill with enough holders and experts', async () => {
    cacheManager.get.mockResolvedValue(null);

    const result = await service.getCriticalSkills(mockSkills, mockAssignments);

    const skill1 = result.find((s) => s.skillId === 'skill-1');
    expect(skill1).toBeDefined();
    expect(skill1!.holderCount).toBe(3);
    expect(skill1!.expertCount).toBe(2);
    expect(skill1!.isCritical).toBe(false);
  });

  it('should identify critical skill with too few holders', async () => {
    cacheManager.get.mockResolvedValue(null);

    const result = await service.getCriticalSkills(mockSkills, mockAssignments);

    const skill2 = result.find((s) => s.skillId === 'skill-2');
    expect(skill2).toBeDefined();
    expect(skill2!.holderCount).toBe(1);
    expect(skill2!.expertCount).toBe(0);
    expect(skill2!.isCritical).toBe(true);
  });

  it('should identify critical skill with no holders', async () => {
    cacheManager.get.mockResolvedValue(null);

    const result = await service.getCriticalSkills(mockSkills, mockAssignments);

    const skill3 = result.find((s) => s.skillId === 'skill-3');
    expect(skill3).toBeDefined();
    expect(skill3!.holderCount).toBe(0);
    expect(skill3!.expertCount).toBe(0);
    expect(skill3!.isCritical).toBe(true);
  });

  it('should identify critical skill with enough holders but too few experts', async () => {
    const assignments: EmployeeSkill[] = [
      {
        id: 'emp-skill-1',
        employeeId: 'emp-1',
        skillId: 'skill-1',
        level: 2,
      } as EmployeeSkill,
      {
        id: 'emp-skill-2',
        employeeId: 'emp-2',
        skillId: 'skill-1',
        level: 2,
      } as EmployeeSkill,
      {
        id: 'emp-skill-3',
        employeeId: 'emp-3',
        skillId: 'skill-1',
        level: 1,
      } as EmployeeSkill,
    ];

    cacheManager.get.mockResolvedValue(null);

    const result = await service.getCriticalSkills(
      [mockSkills[0]],
      assignments,
    );

    const skill1 = result.find((s) => s.skillId === 'skill-1');
    expect(skill1).toBeDefined();
    expect(skill1!.holderCount).toBe(3);
    expect(skill1!.expertCount).toBe(0);
    expect(skill1!.isCritical).toBe(true);
  });

  it('should count experts correctly based on expert level threshold', async () => {
    const assignments: EmployeeSkill[] = [
      {
        id: 'emp-skill-1',
        employeeId: 'emp-1',
        skillId: 'skill-1',
        level: 4,
      } as EmployeeSkill,
      {
        id: 'emp-skill-2',
        employeeId: 'emp-2',
        skillId: 'skill-1',
        level: 3,
      } as EmployeeSkill,
      {
        id: 'emp-skill-3',
        employeeId: 'emp-3',
        skillId: 'skill-1',
        level: 2,
      } as EmployeeSkill,
    ];

    cacheManager.get.mockResolvedValue(null);

    const result = await service.getCriticalSkills(
      [mockSkills[0]],
      assignments,
    );

    const skill1 = result.find((s) => s.skillId === 'skill-1');
    expect(skill1).toBeDefined();
    expect(skill1!.holderCount).toBe(3);
    expect(skill1!.expertCount).toBe(2); // levels 3 and 4
    expect(skill1!.isCritical).toBe(false);
  });

  it('should handle empty assignments', async () => {
    cacheManager.get.mockResolvedValue(null);

    const result = await service.getCriticalSkills(mockSkills, []);

    expect(result).toHaveLength(3);
    result.forEach((skill) => {
      expect(skill.holderCount).toBe(0);
      expect(skill.expertCount).toBe(0);
      expect(skill.isCritical).toBe(true);
    });
  });

  it('should handle empty skills', async () => {
    cacheManager.get.mockResolvedValue(null);

    const result = await service.getCriticalSkills([], mockAssignments);

    expect(result).toHaveLength(0);
  });

  it('should only count assignments for provided skills', async () => {
    cacheManager.get.mockResolvedValue(null);

    const singleSkill = [mockSkills[0]];
    const result = await service.getCriticalSkills(
      singleSkill,
      mockAssignments,
    );

    expect(result).toHaveLength(1);
    expect(result[0].skillId).toBe('skill-1');
    expect(result[0].holderCount).toBe(3);
  });

  // ------------------
  // invalidate
  // ------------------
  it('should invalidate cache', async () => {
    cacheManager.del.mockResolvedValue(undefined as any);

    await service.invalidate();

    expect(cacheManager.del).toHaveBeenCalledWith(
      'skills-matrix:critical-skills:v1:*',
    );
  });

  // ------------------
  // Cache Key Generation
  // ------------------
  it('should generate consistent cache keys for same skill sets', async () => {
    cacheManager.get.mockResolvedValue(null);

    await service.getCriticalSkills(mockSkills, mockAssignments);
    const firstCall = cacheManager.get.mock.calls[0][0];

    jest.clearAllMocks();
    cacheManager.get.mockResolvedValue(null);

    await service.getCriticalSkills(mockSkills, mockAssignments);
    const secondCall = cacheManager.get.mock.calls[0][0];

    expect(firstCall).toBe(secondCall);
  });

  it('should generate different cache keys for different skill sets', async () => {
    cacheManager.get.mockResolvedValue(null);

    await service.getCriticalSkills([mockSkills[0]], mockAssignments);
    const firstCall = cacheManager.get.mock.calls[0][0];

    jest.clearAllMocks();
    cacheManager.get.mockResolvedValue(null);

    await service.getCriticalSkills([mockSkills[1]], mockAssignments);
    const secondCall = cacheManager.get.mock.calls[0][0];

    expect(firstCall).not.toBe(secondCall);
  });

  it('should sort skill IDs in cache key for consistency', async () => {
    cacheManager.get.mockResolvedValue(null);

    const skills1 = [mockSkills[0], mockSkills[1]];
    const skills2 = [mockSkills[1], mockSkills[0]];

    await service.getCriticalSkills(skills1, mockAssignments);
    const firstCall = cacheManager.get.mock.calls[0][0];

    jest.clearAllMocks();
    cacheManager.get.mockResolvedValue(null);

    await service.getCriticalSkills(skills2, mockAssignments);
    const secondCall = cacheManager.get.mock.calls[0][0];

    expect(firstCall).toBe(secondCall);
  });

  // ------------------
  // Threshold Validation
  // ------------------
  it('should use default thresholds', async () => {
    cacheManager.get.mockResolvedValue(null);

    const result = await service.getCriticalSkills(mockSkills, mockAssignments);

    const skill1 = result.find((s) => s.skillId === 'skill-1');
    expect(skill1).toBeDefined();

    // With default thresholds: minHolders=2, minExperts=2, expertLevel=3
    // skill-1 has 3 holders and 2 experts (levels 3,4), so not critical
    expect(skill1!.isCritical).toBe(false);
  });
});
