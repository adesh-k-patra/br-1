import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeSkill } from './employee-skill.entity';
import { EmployeeService } from '../../team-scheduling/employee/employee.service';
import {
  CreateEmployeeSkillInput,
  UpdateEmployeeSkillInput,
} from './employee-skill.input';
import { SkillService } from '../skill/skill.service';
import { CriticalSkillsService } from '../skills-matrix/critical-skills.service';

@Injectable()
export class EmployeeSkillService {
  constructor(
    @InjectRepository(EmployeeSkill)
    private employeeSkillRepository: Repository<EmployeeSkill>,
    private readonly employeeService: EmployeeService,
    private readonly skillService: SkillService,
    private readonly criticalSkillsService: CriticalSkillsService,
  ) {}

  async findAll(): Promise<EmployeeSkill[]> {
    return this.employeeSkillRepository.find();
  }

  async findAllByEmployee(employeeId: string): Promise<EmployeeSkill[]> {
    await this.employeeService.findOne(employeeId);
    return this.employeeSkillRepository.find({
      where: { employeeId },
      relations: ['skill'],
    });
  }

  async create(input: CreateEmployeeSkillInput): Promise<EmployeeSkill> {
    const { employeeId, skillId } = input;
    await this.employeeService.findOne(employeeId);
    await this.skillService.assertAssignable(skillId);

    const existing = await this.employeeSkillRepository.findOne({
      where: { employeeId, skillId },
    });
    if (existing) {
      throw new ConflictException('Employee already has this skill assigned');
    }

    const employeeSkill = this.employeeSkillRepository.create(input);
    const result = this.employeeSkillRepository.save(employeeSkill);
    await this.criticalSkillsService.invalidate();
    return result;
  }

  async update(input: UpdateEmployeeSkillInput): Promise<EmployeeSkill> {
    const employeeSkill = await this.employeeSkillRepository.findOne({
      where: { id: input.id },
    });
    if (!employeeSkill) {
      throw new NotFoundException(
        `EmployeeSkill with ID "${input.id}" not found`,
      );
    }

    if (employeeSkill.level === input.level) {
      return employeeSkill;
    }

    employeeSkill.level = input.level;
    const result = this.employeeSkillRepository.save(employeeSkill);
    await this.criticalSkillsService.invalidate();
    return result;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.employeeSkillRepository.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException('EmployeeSkill not found');
    }
    await this.criticalSkillsService.invalidate();
    return true;
  }

  async countBySkill(skillId: string): Promise<number> {
    return this.employeeSkillRepository.count({
      where: { skillId },
    });
  }
}
