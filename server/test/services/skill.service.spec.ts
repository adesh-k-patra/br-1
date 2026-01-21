/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SkillService } from 'src/team-skills/skill/skill.service';
import { Skill } from 'src/team-skills/skill/skill.entity';
import { EmployeeSkillService } from 'src/team-skills/employee-skill/employee-skill.service';
import { CriticalSkillsService } from 'src/team-skills/skills-matrix/critical-skills.service';

describe('SkillService', () => {
  let service: SkillService;
  let repository: jest.Mocked<Repository<Skill>>;
  let employeeSkillService: jest.Mocked<EmployeeSkillService>;
  let criticalSkillsService: jest.Mocked<CriticalSkillsService>;

  const mockSkill: Skill = {
    id: 'skill-1',
    name: 'typescript',
    category: 'Programming',
    description: 'TypeScript programming language',
    archived: false,
    employeeSkills: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Skill;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockEmployeeSkillService = {
    countBySkill: jest.fn(),
  };

  const mockCriticalSkillsService = {
    invalidate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillService,
        {
          provide: getRepositoryToken(Skill),
          useValue: mockRepository,
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

    service = module.get<SkillService>(SkillService);
    repository = module.get(getRepositoryToken(Skill));
    employeeSkillService = module.get(EmployeeSkillService);
    criticalSkillsService = module.get(CriticalSkillsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ------------------
  // findAll
  // ------------------
  it('should return all skills ordered by name', async () => {
    repository.find.mockResolvedValue([mockSkill]);

    const result = await service.findAll();

    expect(result).toEqual([mockSkill]);
    expect(repository.find).toHaveBeenCalledWith({
      order: { name: 'ASC' },
    });
  });

  // ------------------
  // findOne
  // ------------------
  it('should return a skill by id', async () => {
    repository.findOne.mockResolvedValue(mockSkill);

    const result = await service.findOne('skill-1');

    expect(result).toEqual(mockSkill);
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { id: 'skill-1' },
    });
  });

  it('should throw NotFoundException if skill does not exist', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toThrow(
      NotFoundException,
    );
    await expect(service.findOne('missing-id')).rejects.toThrow(
      'Skill with ID "missing-id" not found',
    );
  });

  // ------------------
  // create
  // ------------------
  it('should create a new skill with normalized name', async () => {
    const input = {
      name: 'TypeScript',
      category: 'Programming',
      description: 'TypeScript programming language',
    };

    repository.findOne.mockResolvedValue(null);
    repository.create.mockReturnValue(mockSkill);
    repository.save.mockResolvedValue(mockSkill);
    criticalSkillsService.invalidate.mockResolvedValue(undefined);

    const result = await service.create(input);

    expect(result).toEqual(mockSkill);
    expect(repository.create).toHaveBeenCalledWith({
      ...input,
      name: 'typescript',
    });
    expect(repository.save).toHaveBeenCalled();
    expect(criticalSkillsService.invalidate).toHaveBeenCalled();
  });

  it('should throw ConflictException when skill name already exists', async () => {
    const input = {
      name: 'TypeScript',
      category: 'Programming',
    };

    repository.findOne.mockResolvedValue(mockSkill);

    await expect(service.create(input)).rejects.toThrow(ConflictException);
    await expect(service.create(input)).rejects.toThrow(
      'Skill with name "TypeScript" already exists',
    );
    expect(criticalSkillsService.invalidate).not.toHaveBeenCalled();
  });

  // ------------------
  // update
  // ------------------
  it('should update a skill with new values', async () => {
    const input = {
      id: 'skill-1',
      name: 'Advanced TypeScript',
      category: 'Programming',
      description: 'Updated description',
    };

    const updatedSkill = {
      ...mockSkill,
      name: 'advanced typescript',
      category: 'Programming',
      description: 'Updated description',
    };

    repository.findOne
      .mockResolvedValueOnce(mockSkill) // findOne in update
      .mockResolvedValueOnce(null); // name uniqueness check

    repository.save.mockResolvedValue(updatedSkill);
    criticalSkillsService.invalidate.mockResolvedValue(undefined);

    const result = await service.update(input);

    expect(result.name).toBe('advanced typescript');
    expect(result.description).toBe('Updated description');
    expect(repository.save).toHaveBeenCalled();
    expect(criticalSkillsService.invalidate).toHaveBeenCalled();
  });

  it('should throw ConflictException when updating to an existing skill name', async () => {
    const anotherSkill: Skill = {
      id: 'skill-2',
      name: 'javascript',
      category: 'Programming',
      description: '',
      archived: false,
    } as Skill;

    const input = {
      id: 'skill-1',
      name: 'JavaScript',
    };

    repository.findOne
      .mockResolvedValueOnce(mockSkill)
      .mockResolvedValueOnce(anotherSkill);

    await expect(service.update(input)).rejects.toThrow(
      new ConflictException('Skill name "JavaScript" already exists'),
    );

    expect(criticalSkillsService.invalidate).not.toHaveBeenCalled();
  });

  it('should allow updating same skill with same name', async () => {
    const input = {
      id: 'skill-1',
      name: 'TypeScript',
      category: 'Updated Category',
    };

    repository.findOne
      .mockResolvedValueOnce(mockSkill)
      .mockResolvedValueOnce(mockSkill);

    repository.save.mockResolvedValue({
      ...mockSkill,
      category: 'Updated Category',
    });

    const result = await service.update(input);

    expect(result.category).toBe('Updated Category');
    expect(criticalSkillsService.invalidate).toHaveBeenCalled();
  });

  // ------------------
  // remove
  // ------------------
  it('should hard delete skill when no assignments exist', async () => {
    repository.findOne.mockResolvedValue(mockSkill);
    employeeSkillService.countBySkill.mockResolvedValue(0);
    repository.delete.mockResolvedValue({ affected: 1, raw: {} });
    criticalSkillsService.invalidate.mockResolvedValue(undefined);

    const result = await service.remove('skill-1');

    expect(result).toBe(true);
    expect(repository.delete).toHaveBeenCalledWith({ id: 'skill-1' });
    expect(repository.save).not.toHaveBeenCalled();
    expect(criticalSkillsService.invalidate).toHaveBeenCalled();
  });

  it('should soft delete skill when assignments exist', async () => {
    repository.findOne.mockResolvedValue(mockSkill);
    employeeSkillService.countBySkill.mockResolvedValue(3);
    repository.save.mockResolvedValue({ ...mockSkill, archived: true });

    const result = await service.remove('skill-1');

    expect(result).toBe(true);
    expect(repository.delete).not.toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalledWith({
      ...mockSkill,
      archived: true,
    });
    expect(criticalSkillsService.invalidate).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when skill does not exist', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.remove('missing-id')).rejects.toThrow(
      NotFoundException,
    );
    await expect(service.remove('missing-id')).rejects.toThrow(
      'Skill not found',
    );
  });

  // ------------------
  // assertAssignable
  // ------------------
  it('should not throw when skill is not archived', async () => {
    repository.findOne.mockResolvedValue({
      ...mockSkill,
      archived: false,
    });

    await expect(service.assertAssignable('skill-1')).resolves.not.toThrow();
  });

  it('should throw BadRequestException when skill is archived', async () => {
    const archivedSkill = { ...mockSkill, archived: true };
    repository.findOne.mockResolvedValue(archivedSkill);

    await expect(service.assertAssignable('skill-1')).rejects.toThrow(
      BadRequestException,
    );
    await expect(service.assertAssignable('skill-1')).rejects.toThrow(
      'Skill is marked as Archived: hidden from new EmployeeSkill assignments',
    );
  });

  it('should throw NotFoundException when skill does not exist', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.assertAssignable('missing-id')).rejects.toThrow(
      NotFoundException,
    );
  });
});
