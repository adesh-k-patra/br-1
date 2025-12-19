import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Employee } from './employee.entity';
import { EmployeeService } from './employee.service';
import { CreateEmployeeInput, UpdateEmployeeInput } from './employee.input';
import { Roles } from '../auth/role.decorator';
import { RoleGuard } from '../auth/role.guard';

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
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateEmployeeInput,
  ): Promise<Employee> {
    return this.employeeService.update(id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(RoleGuard)
  @Roles('manager')
  async deleteEmployee(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.employeeService.delete(id);
  }
}
