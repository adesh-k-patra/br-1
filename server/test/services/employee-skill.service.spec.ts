/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EmployeeSkill } from 'src/team-skills/employee-skill/employee-skill.entity';
import { EmployeeSkillService } from 'src/team-skills/employee-skill/employee-skill.service';
import { SkillService } from 'src/team-skills/skill/skill.service';
import { EmployeeService } from 'src/team-scheduling/employee/employee.service';
import { CriticalSkillsService } from 'src/team-skills/skills-matrix/critical-skills.service';

describe('EmployeeSkillService', () => {
  let service: EmployeeSkillService;
  let repository: jest.Mocked<Repository<EmployeeSkill>>;
  let employeeService: jest.Mocked<EmployeeService>;
  let skillService: jest.Mocked<SkillService>;
  let criticalSkillsService: jest.Mocked<CriticalSkillsService>;

  const mockEmployeeSkill: EmployeeSkill = {
    id: 'emp-skill-1',
    employeeId: 'emp-1',
    skillId: 'skill-1',
    level: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as EmployeeSkill;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };

  const mockEmployeeService = {
    findOne: jest.fn(),
  };

  const mockSkillService = {
    assertAssignable: jest.fn(),
  };

  const mockCriticalSkillsService = {
    invalidate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeSkillService,
        {
          provide: getRepositoryToken(EmployeeSkill),
          useValue: mockRepository,
        },
        {
          provide: EmployeeService,
          useValue: mockEmployeeService,
        },
        {
          provide: SkillService,
          useValue: mockSkillService,
        },
        {
          provide: CriticalSkillsService,
          useValue: mockCriticalSkillsService,
        },
      ],
    }).compile();

    service = module.get<EmployeeSkillService>(EmployeeSkillService);
    repository = module.get(getRepositoryToken(EmployeeSkill));
    employeeService = module.get(EmployeeService);
    skillService = module.get(SkillService);
    criticalSkillsService = module.get(CriticalSkillsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ------------------
  // findAll
  // ------------------
  it('should return all employee skills', async () => {
    repository.find.mockResolvedValue([mockEmployeeSkill]);

    const result = await service.findAll();

    expect(result).toEqual([mockEmployeeSkill]);
    expect(repository.find).toHaveBeenCalledWith();
  });

  // ------------------
  // create
  // ------------------
  it('should create a new employee skill', async () => {
    const input = {
      employeeId: 'emp-1',
      skillId: 'skill-1',
      level: 3,
    };

    employeeService.findOne.mockResolvedValue({} as any);
    skillService.assertAssignable.mockResolvedValue(undefined);
    repository.findOne.mockResolvedValue(null);
    repository.create.mockReturnValue(mockEmployeeSkill);
    repository.save.mockResolvedValue(mockEmployeeSkill);
    criticalSkillsService.invalidate.mockResolvedValue(undefined);

    const result = await service.create(input);

    expect(result).toEqual(mockEmployeeSkill);
    expect(employeeService.findOne).toHaveBeenCalledWith('emp-1');
    expect(skillService.assertAssignable).toHaveBeenCalledWith('skill-1');
    expect(repository.create).toHaveBeenCalledWith(input);
    expect(repository.save).toHaveBeenCalled();
    expect(criticalSkillsService.invalidate).toHaveBeenCalled();
  });

  it('should throw ConflictException when employee already has the skill', async () => {
    const input = {
      employeeId: 'emp-1',
      skillId: 'skill-1',
      level: 3,
    };

    employeeService.findOne.mockResolvedValue({} as any);
    skillService.assertAssignable.mockResolvedValue(undefined);
    repository.findOne.mockResolvedValue(mockEmployeeSkill);

    await expect(service.create(input)).rejects.toThrow(ConflictException);
    await expect(service.create(input)).rejects.toThrow(
      'Employee already has this skill assigned',
    );
    expect(repository.save).not.toHaveBeenCalled();
    expect(criticalSkillsService.invalidate).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when employee does not exist', async () => {
    const input = {
      employeeId: 'missing-emp',
      skillId: 'skill-1',
      level: 3,
    };

    employeeService.findOne.mockRejectedValue(new NotFoundException());

    await expect(service.create(input)).rejects.toThrow(NotFoundException);
    expect(skillService.assertAssignable).not.toHaveBeenCalled();
  });

  it('should throw error when skill is not assignable', async () => {
    const input = {
      employeeId: 'emp-1',
      skillId: 'archived-skill',
      level: 3,
    };

    employeeService.findOne.mockResolvedValue({} as any);
    skillService.assertAssignable.mockRejectedValue(
      new Error('Skill is archived'),
    );

    await expect(service.create(input)).rejects.toThrow('Skill is archived');
    expect(repository.findOne).not.toHaveBeenCalled();
  });

  // ------------------
  // update
  // ------------------
  it('should update employee skill level', async () => {
    const input = {
      id: 'emp-skill-1',
      level: 4,
    };

    const updatedSkill = { ...mockEmployeeSkill, level: 4 };

    repository.findOne.mockResolvedValue(mockEmployeeSkill);
    repository.save.mockResolvedValue(updatedSkill);
    criticalSkillsService.invalidate.mockResolvedValue(undefined);

    const result = await service.update(input);

    expect(result.level).toBe(4);
    expect(repository.save).toHaveBeenCalled();
    expect(criticalSkillsService.invalidate).toHaveBeenCalled();
  });

  it('should return existing skill if level is unchanged', async () => {
    const input = {
      id: 'emp-skill-1',
      level: 4,
    };

    repository.findOne.mockResolvedValue(mockEmployeeSkill);

    const result = await service.update(input);

    expect(result).toEqual(mockEmployeeSkill);
    expect(repository.save).not.toHaveBeenCalled();
    expect(criticalSkillsService.invalidate).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when employee skill does not exist', async () => {
    const input = {
      id: 'missing-id',
      level: 4,
    };

    repository.findOne.mockResolvedValue(null);

    await expect(service.update(input)).rejects.toThrow(NotFoundException);
    await expect(service.update(input)).rejects.toThrow(
      'EmployeeSkill with ID "missing-id" not found',
    );
  });

  // ------------------
  // delete
  // ------------------
  it('should delete an employee skill', async () => {
    repository.delete.mockResolvedValue({ affected: 1, raw: {} });
    criticalSkillsService.invalidate.mockResolvedValue(undefined);

    const result = await service.delete('emp-skill-1');

    expect(result).toBe(true);
    expect(repository.delete).toHaveBeenCalledWith({ id: 'emp-skill-1' });
    expect(criticalSkillsService.invalidate).toHaveBeenCalled();
  });

  it('should throw NotFoundException when employee skill does not exist', async () => {
    repository.delete.mockResolvedValue({ affected: 0, raw: {} });

    await expect(service.delete('missing-id')).rejects.toThrow(
      NotFoundException,
    );
    await expect(service.delete('missing-id')).rejects.toThrow(
      'EmployeeSkill not found',
    );
    expect(criticalSkillsService.invalidate).not.toHaveBeenCalled();
  });

  // ------------------
  // countBySkill
  // ------------------
  it('should return count of employees with a skill', async () => {
    repository.count.mockResolvedValue(5);

    const result = await service.countBySkill('skill-1');

    expect(result).toBe(5);
    expect(repository.count).toHaveBeenCalledWith({
      where: { skillId: 'skill-1' },
    });
  });

  it('should return 0 when no employees have the skill', async () => {
    repository.count.mockResolvedValue(0);

    const result = await service.countBySkill('skill-1');

    expect(result).toBe(0);
  });
});
