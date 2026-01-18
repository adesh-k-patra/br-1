/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Employee } from 'src/employee/employee.entity';
import { EmployeeService } from 'src/employee/employee.service';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let repository: jest.Mocked<Repository<Employee>>;

  const mockEmployee: Employee = {
    id: 'emp-1',
    name: 'John Doe',
    email: 'john@test.com',
    role: 'Developer',
    defaultDailyCapacityHours: 8,
  } as Employee;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        {
          provide: getRepositoryToken(Employee),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
    repository = module.get(getRepositoryToken(Employee));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ------------------
  // findAll
  // ------------------
  it('should return all employees', async () => {
    repository.find.mockResolvedValue([mockEmployee]);

    const result = await service.findAll();

    expect(result).toEqual([mockEmployee]);
    expect(repository.find).toHaveBeenCalledWith({
      order: { name: 'ASC' },
    });
  });

  // ------------------
  // findOne
  // ------------------
  it('should return an employee by id', async () => {
    repository.findOne.mockResolvedValue(mockEmployee);

    const result = await service.findOne('emp-1');

    expect(result).toEqual(mockEmployee);
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { id: 'emp-1' },
    });
  });

  it('should throw NotFoundException if employee does not exist', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  // ------------------
  // create
  // ------------------
  it('should create a new employee', async () => {
    repository.findOne.mockResolvedValue(null);
    repository.create.mockReturnValue(mockEmployee);
    repository.save.mockResolvedValue(mockEmployee);

    const result = await service.create({
      name: 'John Doe',
      email: 'john@test.com',
      role: 'Developer',
      defaultDailyCapacityHours: 8,
    });

    expect(result).toEqual(mockEmployee);
    expect(repository.create).toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalled();
  });

  it('should throw ConflictException when email already exists', async () => {
    repository.findOne.mockResolvedValue(mockEmployee);

    await expect(
      service.create({
        name: 'John',
        email: 'john@test.com',
        role: 'Developer',
        defaultDailyCapacityHours: 8,
      }),
    ).rejects.toThrow(ConflictException);
  });

  // ------------------
  // update
  // ------------------
  it('should update an employee', async () => {
    repository.findOne
      .mockResolvedValueOnce(mockEmployee) // findOne(id)
      .mockResolvedValueOnce(null); // email uniqueness check

    repository.save.mockResolvedValue({
      ...mockEmployee,
      name: 'Updated Name',
    });

    const result = await service.update({
      id: 'emp-1',
      name: 'Updated Name',
    });

    expect(result.name).toBe('Updated Name');
    expect(repository.save).toHaveBeenCalled();
  });

  it('should throw ConflictException when updating to an existing email', async () => {
    const anotherEmployee: Employee = {
      id: 'emp-2',
      name: 'Jane Doe',
      email: 'existing@test.com',
      role: 'Manager',
      defaultDailyCapacityHours: 8,
    } as Employee;

    repository.findOne.mockReset();
    repository.findOne.mockResolvedValueOnce(mockEmployee);
    repository.findOne.mockResolvedValueOnce(anotherEmployee);

    await expect(
      service.update({
        id: 'emp-1',
        email: 'existing@test.com',
      }),
    ).rejects.toThrow(ConflictException);
  });

  // ------------------
  // delete
  // ------------------
  it('should delete an employee', async () => {
    repository.findOne.mockResolvedValue(mockEmployee);
    repository.remove.mockResolvedValue(mockEmployee);

    const result = await service.delete('emp-1');

    expect(result).toBe(true);
    expect(repository.remove).toHaveBeenCalledWith(mockEmployee);
  });
});
