import { Resolver, Mutation, Args, ID, Query } from '@nestjs/graphql';
import { EmployeeSkill } from './employee-skill.entity';
import { UseGuards } from '@nestjs/common';
import { RoleGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';
import { EmployeeSkillService } from './employee-skill.service';
import {
  CreateEmployeeSkillInput,
  UpdateEmployeeSkillInput,
} from './employee-skill.input';

@Resolver(() => EmployeeSkill)
export class EmployeeSkillResolver {
  constructor(private readonly employeeSkillService: EmployeeSkillService) {}

  @Query(() => [EmployeeSkill], { name: 'employeeSkills' })
  async findAllByEmployee(
    @Args('employeeId', { type: () => ID }) employeeId: string,
  ): Promise<EmployeeSkill[]> {
    return this.employeeSkillService.findAllByEmployee(employeeId);
  }

  @Mutation(() => EmployeeSkill)
  @UseGuards(RoleGuard)
  @Roles('manager')
  async assignSkill(
    @Args('input')
    input: CreateEmployeeSkillInput,
  ): Promise<EmployeeSkill> {
    return this.employeeSkillService.create(input);
  }

  @Mutation(() => EmployeeSkill)
  @UseGuards(RoleGuard)
  @Roles('manager')
  async updateEmployeeSkill(
    @Args('input')
    input: UpdateEmployeeSkillInput,
  ): Promise<EmployeeSkill> {
    return this.employeeSkillService.update(input);
  }

  @Mutation(() => Boolean)
  @UseGuards(RoleGuard)
  @Roles('manager')
  async unassignSkill(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.employeeSkillService.delete(id);
  }
}
