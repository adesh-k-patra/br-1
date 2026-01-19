/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  Repository,
  DeleteResult,
  SelectQueryBuilder,
  DataSource,
  EntityManager,
} from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import {
  Absence,
  AbsenceStatus,
  AbsenceType,
} from 'src/absence/absence.entity';
import { AbsenceService } from 'src/absence/absence.service';
import { EmployeeService } from 'src/employee/employee.service';
import { Employee } from 'src/employee/employee.entity';

describe('AbsenceService', () => {
  let service: AbsenceService;
  let repository: jest.Mocked<Repository<Absence>>;
  let employeeService: EmployeeService;
  let queryBuilder: SelectQueryBuilder<Absence>;
  let dataSource: jest.Mocked<DataSource>;
  let entityManager: jest.Mocked<EntityManager>;

  const mockEmployee: Employee = {
    id: 'emp-1',
    name: 'John Doe',
    email: 'john@test.com',
    role: 'Developer',
    defaultDailyCapacityHours: 8,
  } as Employee;

  const mockAbsence: Absence = {
    id: 'abs-1',
    employeeId: 'emp-1',
    employee: mockEmployee,
    type: AbsenceType.PAID_LEAVE,
    status: AbsenceStatus.APPROVED,
    startDate: '2024-01-15',
    endDate: '2024-01-20',
    comment: 'Vacation',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getCount: jest.fn(),
  } as unknown as SelectQueryBuilder<Absence>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockEmployeeService = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as EmployeeService;

  const mockEntityManager = {
    getRepository: jest.fn(),
  } as unknown as jest.Mocked<EntityManager>;

  const mockDataSource = {
    transaction: jest.fn(),
  } as unknown as jest.Mocked<DataSource>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AbsenceService,
        {
          provide: getRepositoryToken(Absence),
          useValue: mockRepository,
        },
        {
          provide: EmployeeService,
          useValue: mockEmployeeService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<AbsenceService>(AbsenceService);
    repository = module.get(getRepositoryToken(Absence));
    employeeService = module.get<EmployeeService>(EmployeeService);
    dataSource = module.get<DataSource>(DataSource) as jest.Mocked<DataSource>;
    entityManager = mockEntityManager;
    queryBuilder = mockQueryBuilder;

    (dataSource.transaction as jest.Mock).mockImplementation(
      async (callback: (manager: EntityManager) => Promise<unknown>) => {
        const result = await callback(entityManager);
        return result;
      },
    );

    entityManager.getRepository.mockReturnValue(
      mockRepository as unknown as Repository<Absence>,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ------------------
  // getAbsences
  // ------------------
  describe('getAbsences', () => {
    it('should return all absences with no filters', async () => {
      repository.find.mockResolvedValue([mockAbsence]);

      const result = await service.getAbsences();

      expect(result).toEqual([mockAbsence]);
      expect(repository.find).toHaveBeenCalledWith({
        where: {},
        relations: ['employee'],
        order: { startDate: 'DESC' },
      });
    });

    it('should filter by employeeId', async () => {
      repository.find.mockResolvedValue([mockAbsence]);

      const result = await service.getAbsences('emp-1');

      expect(result).toEqual([mockAbsence]);
      expect(repository.find).toHaveBeenCalledWith({
        where: { employeeId: 'emp-1' },
        relations: ['employee'],
        order: { startDate: 'DESC' },
      });
    });

    it('should filter by status', async () => {
      repository.find.mockResolvedValue([mockAbsence]);

      const result = await service.getAbsences(
        undefined,
        undefined,
        undefined,
        AbsenceStatus.APPROVED,
      );

      expect(result).toEqual([mockAbsence]);
      expect(repository.find).toHaveBeenCalledWith({
        where: { status: AbsenceStatus.APPROVED },
        relations: ['employee'],
        order: { startDate: 'DESC' },
      });
    });

    it('should filter by date range', async () => {
      repository.find.mockResolvedValue([mockAbsence]);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const result = await service.getAbsences(undefined, startDate, endDate);

      expect(result).toEqual([mockAbsence]);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  // ------------------
  // getAbsencesByEmployeeIds
  // ------------------
  describe('getAbsencesByEmployeeIds', () => {
    it('should return absences for multiple employees', async () => {
      repository.find.mockResolvedValue([mockAbsence]);

      const result = await service.getAbsencesByEmployeeIds(['emp-1', 'emp-2']);

      expect(result).toEqual([mockAbsence]);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  // ------------------
  // recordAbsence
  // ------------------
  describe('recordAbsence', () => {
    const recordInput = {
      employeeId: 'emp-1',
      type: AbsenceType.PAID_LEAVE,
      startDate: '2024-02-01',
      endDate: '2024-02-05',
      comment: 'Holiday',
    };

    it('should successfully record an absence', async () => {
      (employeeService.findOne as jest.Mock).mockResolvedValue(mockEmployee);
      repository.createQueryBuilder.mockReturnValue(queryBuilder);
      (queryBuilder.getMany as jest.Mock).mockResolvedValue([]);
      repository.create.mockReturnValue(mockAbsence);
      repository.save.mockResolvedValue(mockAbsence);
      repository.findOne.mockResolvedValue(mockAbsence);

      const result = await service.recordAbsence(recordInput);

      expect(result).toEqual(mockAbsence);
      expect(employeeService.findOne).toHaveBeenCalledWith('emp-1');
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if start date is after end date', async () => {
      (employeeService.findOne as jest.Mock).mockResolvedValue(mockEmployee);

      await expect(
        service.recordAbsence({
          ...recordInput,
          startDate: '2024-02-10',
          endDate: '2024-02-05',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if overlapping absence exists', async () => {
      (employeeService.findOne as jest.Mock).mockResolvedValue(mockEmployee);
      repository.createQueryBuilder.mockReturnValue(queryBuilder);
      (queryBuilder.getMany as jest.Mock).mockResolvedValue([mockAbsence]);

      await expect(service.recordAbsence(recordInput)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if employee does not exist', async () => {
      (employeeService.findOne as jest.Mock).mockRejectedValue(
        new NotFoundException('Employee not found'),
      );

      await expect(service.recordAbsence(recordInput)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ------------------
  // requestAbsence
  // ------------------
  describe('requestAbsence', () => {
    const requestInput = {
      type: AbsenceType.SICK_LEAVE,
      startDate: '2024-03-01',
      endDate: '2024-03-03',
      comment: 'Sick',
    };

    it('should successfully request an absence', async () => {
      const requestedAbsence = {
        ...mockAbsence,
        status: AbsenceStatus.REQUESTED,
      };

      (employeeService.findOne as jest.Mock).mockResolvedValue(mockEmployee);
      repository.createQueryBuilder.mockReturnValue(queryBuilder);
      (queryBuilder.getMany as jest.Mock).mockResolvedValue([]);
      repository.create.mockReturnValue(requestedAbsence);
      repository.save.mockResolvedValue(requestedAbsence);
      repository.findOne.mockResolvedValue(requestedAbsence);

      const result = await service.requestAbsence('emp-1', requestInput);

      expect(result).toEqual(requestedAbsence);
      expect(result.status).toBe(AbsenceStatus.REQUESTED);
    });

    it('should throw BadRequestException if start date is after end date', async () => {
      (employeeService.findOne as jest.Mock).mockResolvedValue(mockEmployee);

      await expect(
        service.requestAbsence('emp-1', {
          ...requestInput,
          startDate: '2024-03-10',
          endDate: '2024-03-05',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if overlapping absence exists', async () => {
      (employeeService.findOne as jest.Mock).mockResolvedValue(mockEmployee);
      repository.createQueryBuilder.mockReturnValue(queryBuilder);
      (queryBuilder.getMany as jest.Mock).mockResolvedValue([mockAbsence]);

      await expect(
        service.requestAbsence('emp-1', requestInput),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ------------------
  // updateAbsenceStatus
  // ------------------
  describe('updateAbsenceStatus', () => {
    it('should approve a requested absence', async () => {
      const requestedAbsence = {
        ...mockAbsence,
        status: AbsenceStatus.REQUESTED,
      };
      const approvedAbsence = {
        ...mockAbsence,
        status: AbsenceStatus.APPROVED,
      };

      repository.findOne.mockReset();
      repository.findOne.mockResolvedValueOnce(requestedAbsence);
      repository.createQueryBuilder.mockReturnValue(queryBuilder);
      (queryBuilder.getMany as jest.Mock).mockResolvedValue([]);
      repository.save.mockResolvedValue(approvedAbsence);

      const result = await service.updateAbsenceStatus({
        absenceId: 'abs-1',
        status: AbsenceStatus.APPROVED,
      });

      expect(result.status).toBe(AbsenceStatus.APPROVED);
      expect(repository.save).toHaveBeenCalled();
      expect(dataSource.transaction).toHaveBeenCalled();
    });

    it('should reject a requested absence', async () => {
      const requestedAbsence = {
        ...mockAbsence,
        status: AbsenceStatus.REQUESTED,
      };
      const rejectedAbsence = {
        ...mockAbsence,
        status: AbsenceStatus.REJECTED,
      };

      repository.findOne.mockResolvedValue(requestedAbsence);
      repository.save.mockResolvedValue(rejectedAbsence);

      const result = await service.updateAbsenceStatus({
        absenceId: 'abs-1',
        status: AbsenceStatus.REJECTED,
      });

      expect(result.status).toBe(AbsenceStatus.REJECTED);
      expect(dataSource.transaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException if absence does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.updateAbsenceStatus({
          absenceId: 'non-existent',
          status: AbsenceStatus.APPROVED,
        }),
      ).rejects.toThrow(NotFoundException);

      expect(dataSource.transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException if absence is not in REQUESTED status', async () => {
      repository.findOne.mockResolvedValue(mockAbsence);

      await expect(
        service.updateAbsenceStatus({
          absenceId: 'abs-1',
          status: AbsenceStatus.REJECTED,
        }),
      ).rejects.toThrow(BadRequestException);

      expect(dataSource.transaction).toHaveBeenCalled();
    });

    it('should return absence unchanged if status is the same', async () => {
      const requestedAbsence = {
        ...mockAbsence,
        status: AbsenceStatus.REQUESTED,
      };

      repository.findOne.mockResolvedValue(requestedAbsence);

      const result = await service.updateAbsenceStatus({
        absenceId: 'abs-1',
        status: AbsenceStatus.REQUESTED,
      });

      expect(result).toEqual(requestedAbsence);
      expect(repository.save).not.toHaveBeenCalled();
      expect(dataSource.transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException if approving with overlapping approved absences', async () => {
      const requestedAbsence = {
        ...mockAbsence,
        status: AbsenceStatus.REQUESTED,
      };

      repository.findOne.mockReset();
      repository.findOne.mockResolvedValueOnce(requestedAbsence);
      repository.createQueryBuilder.mockReturnValue(queryBuilder);
      (queryBuilder.getMany as jest.Mock).mockResolvedValue([mockAbsence]);

      await expect(
        service.updateAbsenceStatus({
          absenceId: 'abs-1',
          status: AbsenceStatus.APPROVED,
        }),
      ).rejects.toThrow(BadRequestException);

      expect(dataSource.transaction).toHaveBeenCalled();
    });
  });

  // ------------------
  // deleteAbsence
  // ------------------
  describe('deleteAbsence', () => {
    it('should successfully delete an absence', async () => {
      const deleteResult: DeleteResult = {
        affected: 1,
        raw: {},
      };
      repository.delete.mockResolvedValue(deleteResult);

      const result = await service.deleteAbsence('abs-1');

      expect(result).toBe(true);
      expect(repository.delete).toHaveBeenCalledWith({ id: 'abs-1' });
    });

    it('should throw NotFoundException if absence does not exist', async () => {
      const deleteResult: DeleteResult = {
        affected: 0,
        raw: {},
      };
      repository.delete.mockResolvedValue(deleteResult);

      await expect(service.deleteAbsence('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ------------------
  // hasApprovedAbsenceOnDate
  // ------------------
  describe('hasApprovedAbsenceOnDate', () => {
    it('should return true if employee has approved absence on date', async () => {
      repository.createQueryBuilder.mockReturnValue(queryBuilder);
      (queryBuilder.getCount as jest.Mock).mockResolvedValue(1);

      const result = await service.hasApprovedAbsenceOnDate(
        'emp-1',
        '2024-01-17',
      );

      expect(result).toBe(true);
    });

    it('should return false if employee has no approved absence on date', async () => {
      repository.createQueryBuilder.mockReturnValue(queryBuilder);
      (queryBuilder.getCount as jest.Mock).mockResolvedValue(0);

      const result = await service.hasApprovedAbsenceOnDate(
        'emp-1',
        '2024-02-01',
      );

      expect(result).toBe(false);
    });
  });
});
