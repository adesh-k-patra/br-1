import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './employee.entity';
import { CreateEmployeeInput, UpdateEmployeeInput } from './employee.input';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  async findAll(): Promise<Employee[]> {
    return this.employeeRepository.find({
      relations: ['absences', 'availabilities'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ['absences', 'availabilities'],
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return employee;
  }

  async create(input: CreateEmployeeInput): Promise<Employee> {
    const existing = await this.employeeRepository.findOne({
      where: { email: input.email },
    });
    if (existing) {
      throw new ConflictException(
        `Employee with email ${input.email} already exists`,
      );
    }
    const employee = this.employeeRepository.create(input);
    return this.employeeRepository.save(employee);
  }

  async update(input: UpdateEmployeeInput): Promise<Employee> {
    const employee = await this.findOne(input.id);
    if (input.email && input.email !== employee.email) {
      const existing = await this.employeeRepository.findOne({
        where: { email: input.email },
      });
      if (existing) {
        throw new ConflictException(
          `Employee with email ${input.email} already exists`,
        );
      }
    }
    Object.assign(employee, input);
    return this.employeeRepository.save(employee);
  }

  async delete(id: string): Promise<boolean> {
    const employee = await this.findOne(id);
    await this.employeeRepository.remove(employee);
    return true;
  }
}
