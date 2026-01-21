import { Test, TestingModule } from '@nestjs/testing';
import { Employee } from 'src/team-scheduling/employee/employee.entity';
import { EmployeeService } from 'src/team-scheduling/employee/employee.service';
import { EmployeeSkill } from 'src/team-skills/employee-skill/employee-skill.entity';
import { EmployeeSkillService } from 'src/team-skills/employee-skill/employee-skill.service';
import { Skill } from 'src/team-skills/skill/skill.entity';
import { SkillService } from 'src/team-skills/skill/skill.service';
import { CriticalSkillsService } from 'src/team-skills/skills-matrix/critical-skills.service';
import { ComparisonOperator } from 'src/team-skills/skills-matrix/skills-matrix.input';
import { SkillsMatrixService } from 'src/team-skills/skills-matrix/skills-matrix.service';

describe('SkillsMatrixService', () => {
  let service: SkillsMatrixService;
  let employeeService: jest.Mocked<EmployeeService>;
  let skillService: jest.Mocked<SkillService>;
  let employeeSkillService: jest.Mocked<EmployeeSkillService>;
  let criticalSkillsService: jest.Mocked<CriticalSkillsService>;

  const mockEmployees: Employee[] = [
    {
      id: 'emp-1',
      name: 'John Doe',
      email: 'john@test.com',
      role: 'Developer',
    } as Employee,
    {
      id: 'emp-2',
      name: 'Jane Smith',
      email: 'jane@test.com',
      role: 'Developer',
    } as Employee,
  ];

  const mockSkills: Skill[] = [
    {
      id: 'skill-1',
      name: 'typescript',
      category: 'Programming',
      archived: false,
    } as Skill,
    {
      id: 'skill-2',
      name: 'react',
      category: 'Framework',
      archived: false,
    } as Skill,
    {
      id: 'skill-3',
      name: 'python',
      category: 'Programming',
      archived: false,
    } as Skill,
  ];

  const mockAssignments: EmployeeSkill[] = [
    {
      id: 'emp-skill-1',
      employeeId: 'emp-1',
      skillId: 'skill-1',
      level: 3,
    } as EmployeeSkill,
    {
      id: 'emp-skill-2',
      employeeId: 'emp-1',
      skillId: 'skill-2',
      level: 2,
    } as EmployeeSkill,
    {
      id: 'emp-skill-3',
      employeeId: 'emp-2',
      skillId: 'skill-1',
      level: 4,
    } as EmployeeSkill,
  ];

  const mockCriticalSkills = [
    {
      skillId: 'skill-1',
      skillName: 'typescript',
      holderCount: 2,
      expertCount: 2,
      isCritical: false,
    },
    {
      skillId: 'skill-2',
      skillName: 'react',
      holderCount: 1,
      expertCount: 0,
      isCritical: true,
    },
    {
      skillId: 'skill-3',
      skillName: 'python',
      holderCount: 0,
      expertCount: 0,
      isCritical: true,
    },
  ];

  const mockEmployeeService = {
    findAll: jest.fn(),
  };

  const mockSkillService = {
    findAll: jest.fn(),
  };

  const mockEmployeeSkillService = {
    findAll: jest.fn(),
  };

  const mockCriticalSkillsService = {
    getCriticalSkills: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsMatrixService,
        {
          provide: EmployeeService,
          useValue: mockEmployeeService,
        },
        {
          provide: SkillService,
          useValue: mockSkillService,
        },
        {
          provide: EmployeeSkillService,
          useValue: mockEmployeeSkillService,
        },
        {
          provide: CriticalSkillsService,
          useValue: mockCriticalSkillsService,
        },
      ],
    }).compile();

    service = module.get<SkillsMatrixService>(SkillsMatrixService);
    employeeService = module.get(EmployeeService);
    skillService = module.get(SkillService);
    employeeSkillService = module.get(EmployeeSkillService);
    criticalSkillsService = module.get(CriticalSkillsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ------------------
  // buildMatrix - Basic
  // ------------------
  it('should build a complete skills matrix', async () => {
    employeeService.findAll.mockResolvedValue(mockEmployees);
    skillService.findAll.mockResolvedValue(mockSkills);
    employeeSkillService.findAll.mockResolvedValue(mockAssignments);
    criticalSkillsService.getCriticalSkills.mockResolvedValue(
      mockCriticalSkills,
    );

    const result = await service.buildMatrix();

    expect(result.skills).toHaveLength(3);
    expect(result.employees).toHaveLength(2);
    expect(result.criticalSkills).toEqual(mockCriticalSkills);

    expect(result.employees[0].id).toBe('emp-1');
    expect(result.employees[0].skills).toHaveLength(2);
    expect(result.employees[1].id).toBe('emp-2');
    expect(result.employees[1].skills).toHaveLength(1);
  });

  it('should return empty matrix when no data exists', async () => {
    employeeService.findAll.mockResolvedValue([]);
    skillService.findAll.mockResolvedValue([]);
    employeeSkillService.findAll.mockResolvedValue([]);
    criticalSkillsService.getCriticalSkills.mockResolvedValue([]);

    const result = await service.buildMatrix();

    expect(result.skills).toHaveLength(0);
    expect(result.employees).toHaveLength(0);
    expect(result.criticalSkills).toHaveLength(0);
  });

  it('should include employees with no skills', async () => {
    employeeService.findAll.mockResolvedValue(mockEmployees);
    skillService.findAll.mockResolvedValue(mockSkills);
    employeeSkillService.findAll.mockResolvedValue([]);
    criticalSkillsService.getCriticalSkills.mockResolvedValue([]);

    const result = await service.buildMatrix();

    expect(result.employees).toHaveLength(2);
    expect(result.employees[0].skills).toHaveLength(0);
    expect(result.employees[1].skills).toHaveLength(0);
  });

  // ------------------
  // buildMatrix - Filters
  // ------------------
  it('should filter skills by category', async () => {
    employeeService.findAll.mockResolvedValue(mockEmployees);
    skillService.findAll.mockResolvedValue(mockSkills);
    employeeSkillService.findAll.mockResolvedValue(mockAssignments);
    criticalSkillsService.getCriticalSkills.mockResolvedValue([]);

    const filters = { category: 'Programming' };
    const result = await service.buildMatrix(filters);

    expect(result.skills).toHaveLength(2);
    expect(result.skills.every((s) => s.category === 'Programming')).toBe(true);
  });

  it('should filter skills by name (case insensitive)', async () => {
    employeeService.findAll.mockResolvedValue(mockEmployees);
    skillService.findAll.mockResolvedValue(mockSkills);
    employeeSkillService.findAll.mockResolvedValue(mockAssignments);
    criticalSkillsService.getCriticalSkills.mockResolvedValue([]);

    const filters = { skillName: 'TYPE' };
    const result = await service.buildMatrix(filters);

    expect(result.skills).toHaveLength(1);
    expect(result.skills[0].name).toBe('typescript');
  });

  it('should filter employees by level (>=)', async () => {
    employeeService.findAll.mockResolvedValue(mockEmployees);
    skillService.findAll.mockResolvedValue(mockSkills);
    employeeSkillService.findAll.mockResolvedValue(mockAssignments);
    criticalSkillsService.getCriticalSkills.mockResolvedValue([]);

    const filters = {
      level: { op: ComparisonOperator.GREATER_THAN_OR_EQUAL, value: 3 },
    };
    const result = await service.buildMatrix(filters);

    expect(result.employees).toHaveLength(2);
    expect(result.employees[0].skills).toHaveLength(1);
    expect(result.employees[0].skills[0].level).toBeGreaterThanOrEqual(3);
    expect(result.employees[1].skills).toHaveLength(1);
    expect(result.employees[1].skills[0].level).toBeGreaterThanOrEqual(3);
  });

  it('should filter employees by level (<=)', async () => {
    employeeService.findAll.mockResolvedValue(mockEmployees);
    skillService.findAll.mockResolvedValue(mockSkills);
    employeeSkillService.findAll.mockResolvedValue(mockAssignments);
    criticalSkillsService.getCriticalSkills.mockResolvedValue([]);

    const filters = {
      level: { op: ComparisonOperator.LESS_THAN_OR_EQUAL, value: 2 },
    };
    const result = await service.buildMatrix(filters);

    expect(result.employees).toHaveLength(1);
    expect(result.employees[0].id).toBe('emp-1');
    expect(result.employees[0].skills).toHaveLength(1);
    expect(result.employees[0].skills[0].level).toBeLessThanOrEqual(2);
  });

  it('should filter employees by level (=)', async () => {
    employeeService.findAll.mockResolvedValue(mockEmployees);
    skillService.findAll.mockResolvedValue(mockSkills);
    employeeSkillService.findAll.mockResolvedValue(mockAssignments);
    criticalSkillsService.getCriticalSkills.mockResolvedValue([]);

    const filters = {
      level: { op: ComparisonOperator.EQUAL, value: 4 },
    };
    const result = await service.buildMatrix(filters);

    expect(result.employees).toHaveLength(1);
    expect(result.employees[0].id).toBe('emp-2');
    expect(result.employees[0].skills).toHaveLength(1);
    expect(result.employees[0].skills[0].level).toBe(4);
  });

  it('should exclude employees with no matching skills after level filter', async () => {
    employeeService.findAll.mockResolvedValue(mockEmployees);
    skillService.findAll.mockResolvedValue(mockSkills);
    employeeSkillService.findAll.mockResolvedValue(mockAssignments);
    criticalSkillsService.getCriticalSkills.mockResolvedValue([]);

    const filters = {
      level: { op: ComparisonOperator.EQUAL, value: 1 },
    };
    const result = await service.buildMatrix(filters);

    expect(result.employees).toHaveLength(0);
  });

  it('should apply multiple filters together', async () => {
    employeeService.findAll.mockResolvedValue(mockEmployees);
    skillService.findAll.mockResolvedValue(mockSkills);
    employeeSkillService.findAll.mockResolvedValue(mockAssignments);
    criticalSkillsService.getCriticalSkills.mockResolvedValue([]);

    const filters = {
      category: 'Programming',
      level: { op: ComparisonOperator.GREATER_THAN_OR_EQUAL, value: 3 },
    };
    const result = await service.buildMatrix(filters);

    expect(result.skills).toHaveLength(2);
    expect(result.skills.every((s) => s.category === 'Programming')).toBe(true);
    expect(result.employees).toHaveLength(2);
  });

  // ------------------
  // exportCSV
  // ------------------
  it('should export matrix to CSV', async () => {
    employeeService.findAll.mockResolvedValue(mockEmployees);
    skillService.findAll.mockResolvedValue(mockSkills);
    employeeSkillService.findAll.mockResolvedValue(mockAssignments);
    criticalSkillsService.getCriticalSkills.mockResolvedValue(
      mockCriticalSkills,
    );

    const result = await service.exportCSV();

    expect(typeof result).toBe('string');
    expect(result).toContain('Employee');
    expect(result).toContain('typescript');
    expect(result).toContain('react');
    expect(result).toContain('python');
  });

  it('should export filtered matrix to CSV', async () => {
    employeeService.findAll.mockResolvedValue(mockEmployees);
    skillService.findAll.mockResolvedValue(mockSkills);
    employeeSkillService.findAll.mockResolvedValue(mockAssignments);
    criticalSkillsService.getCriticalSkills.mockResolvedValue([]);

    const filters = { category: 'Programming' };
    const result = await service.exportCSV(filters);

    expect(typeof result).toBe('string');
    expect(result).toContain('typescript');
    expect(result).toContain('python');
    expect(result).not.toContain('react');
  });
});
