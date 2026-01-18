import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
  Context,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Employee } from './employee.entity';
import { EmployeeService } from './employee.service';
import { CreateEmployeeInput, UpdateEmployeeInput } from './employee.input';
import { Roles } from '../auth/role.decorator';
import { RoleGuard } from '../auth/role.guard';
import { Absence } from 'src/absence/absence.entity';
import type { IGraphQLContext } from 'src/common/loaders';
import { Availability } from 'src/availability/availability.entity';

@Resolver(() => Employee)
export class EmployeeResolver {
  constructor(private employeeService: EmployeeService) {}

  @Query(() => [Employee], { name: 'employees' })
  async getEmployees(): Promise<Employee[]> {
    return this.employeeService.findAll();
  }

  @Query(() => Employee, { name: 'employee' })
  async getEmployee(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Employee> {
    return this.employeeService.findOne(id);
  }

  @Mutation(() => Employee)
  @UseGuards(RoleGuard)
  @Roles('manager')
  async createEmployee(
    @Args('input') input: CreateEmployeeInput,
  ): Promise<Employee> {
    return this.employeeService.create(input);
  }

  @Mutation(() => Employee)
  @UseGuards(RoleGuard)
  @Roles('manager')
  async updateEmployee(
    @Args('input') input: UpdateEmployeeInput,
  ): Promise<Employee> {
    return this.employeeService.update(input);
  }

  @Mutation(() => Boolean)
  @UseGuards(RoleGuard)
  @Roles('manager')
  async deleteEmployee(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.employeeService.delete(id);
  }

  @ResolveField(() => [Absence])
  async absences(
    @Parent() employee: Employee,
    @Context() context: IGraphQLContext,
  ): Promise<Absence[]> {
    return context.loaders.absences.load(employee.id);
  }

  @ResolveField(() => [Availability])
  async availabilities(
    @Parent() employee: Employee,
    @Context() context: IGraphQLContext,
  ): Promise<Availability[]> {
    return context.loaders.availabilities.load(employee.id);
  }
}
