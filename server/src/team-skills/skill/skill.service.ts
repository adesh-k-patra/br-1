import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './skill.entity';
import { CreateSkillInput, UpdateSkillInput } from './skill.input';
import { EmployeeSkillService } from '../employee-skill/employee-skill.service';
import { CriticalSkillsService } from '../skills-matrix/critical-skills.service';

@Injectable()
export class SkillService {
  constructor(
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
    @Inject(forwardRef(() => EmployeeSkillService))
    private readonly employeeSkillService: EmployeeSkillService,
    private readonly criticalSkillsService: CriticalSkillsService,
  ) {}

  async findAll(): Promise<Skill[]> {
    return this.skillRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Skill> {
    const skill = await this.skillRepository.findOne({ where: { id } });
    if (!skill) {
      throw new NotFoundException(`Skill with ID "${id}" not found`);
    }
    return skill;
  }

  async create(input: CreateSkillInput): Promise<Skill> {
    const normalizedName = input.name.trim().toLowerCase();

    const existing = await this.skillRepository.findOne({
      where: { name: normalizedName },
    });
    if (existing) {
      throw new ConflictException(
        `Skill with name "${input.name}" already exists`,
      );
    }

    const skill = this.skillRepository.create({
      ...input,
      name: normalizedName,
    });
    const result = this.skillRepository.save(skill);
    await this.criticalSkillsService.invalidate();
    return result;
  }

  async update(input: UpdateSkillInput): Promise<Skill> {
    const skill = await this.findOne(input.id);

    if (input.name) {
      const normalizedName = input.name.trim().toLowerCase();

      const existing = await this.skillRepository.findOne({
        where: { name: normalizedName },
      });
      if (existing && existing.id !== skill.id) {
        throw new ConflictException(
          `Skill name "${input.name}" already exists`,
        );
      }

      skill.name = normalizedName;
    }

    if (input.category !== undefined) {
      skill.category = input.category;
    }
    if (input.description !== undefined) {
      skill.description = input.description;
    }

    const result = this.skillRepository.save(skill);
    await this.criticalSkillsService.invalidate();
    return result;
  }

  async remove(id: string): Promise<boolean> {
    const skill = await this.skillRepository.findOne({
      where: { id },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    const assignmentCount = await this.employeeSkillService.countBySkill(
      skill.id,
    );

    // Hard Delete
    if (assignmentCount === 0) {
      await this.skillRepository.delete({ id });
      await this.criticalSkillsService.invalidate();
    } else {
      // Soft Delete
      skill.archived = true;
      await this.skillRepository.save(skill);
    }

    return true;
  }

  async assertAssignable(skillId: string): Promise<void> {
    const skill = await this.findOne(skillId);
    if (skill.archived) {
      throw new BadRequestException(
        'Skill is marked as Archived: hidden from new EmployeeSkill assignments',
      );
    }
  }
}
