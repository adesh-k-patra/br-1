/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DeleteResult, DataSource, EntityManager } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Availability } from 'src/availability/availability.entity';
import { AvailabilityService } from 'src/availability/availability.service';
import { EmployeeService } from 'src/employee/employee.service';
import { AbsenceService } from 'src/absence/absence.service';
import { Employee } from 'src/employee/employee.entity';

describe('AvailabilityService', () => {
  let service: AvailabilityService;
  let repository: jest.Mocked<Repository<Availability>>;
  let employeeService: EmployeeService;
  let absenceService: AbsenceService;
  let dataSource: jest.Mocked<DataSource>;
  let entityManager: jest.Mocked<EntityManager>;

  const mockEmployee: Employee = {
    id: 'emp-1',
    name: 'John Doe',
    email: 'john@test.com',
    role: 'Developer',
    defaultDailyCapacityHours: 8,
  } as Employee;

  const mockAvailability: Availability = {
    id: 'avail-1',
    employeeId: 'emp-1',
    employee: mockEmployee,
    date: '2024-01-15',
    capacityHours: 8,
    note: 'Regular day',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockEmployeeService = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as EmployeeService;

  const mockAbsenceService = {
    getAbsences: jest.fn(),
    getAbsencesByEmployeeIds: jest.fn(),
    recordAbsence: jest.fn(),
    requestAbsence: jest.fn(),
    updateAbsenceStatus: jest.fn(),
    deleteAbsence: jest.fn(),
    hasApprovedAbsenceOnDate: jest.fn(),
  } as unknown as AbsenceService;

  const mockEntityManager = {
    getRepository: jest.fn(),
  } as unknown as jest.Mocked<EntityManager>;

  const mockDataSource = {
    transaction: jest.fn(),
  } as unknown as jest.Mocked<DataSource>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityService,
        {
          provide: getRepositoryToken(Availability),
          useValue: mockRepository,
        },
        {
          provide: EmployeeService,
          useValue: mockEmployeeService,
        },
        {
          provide: AbsenceService,
          useValue: mockAbsenceService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<AvailabilityService>(AvailabilityService);
    repository = module.get(getRepositoryToken(Availability));
    employeeService = module.get<EmployeeService>(EmployeeService);
    absenceService = module.get<AbsenceService>(AbsenceService);
    dataSource = module.get<DataSource>(DataSource) as jest.Mocked<DataSource>;
    entityManager = mockEntityManager;

    (dataSource.transaction as jest.Mock).mockImplementation(
      async (callback: (manager: EntityManager) => Promise<unknown>) => {
        const result = await callback(entityManager);
        return result;
      },
    );

    entityManager.getRepository.mockReturnValue(
      mockRepository as unknown as Repository<Availability>,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ------------------
  // getAvailabilities
  // ------------------
  describe('getAvailabilities', () => {
    it('should return all availabilities with no filters', async () => {
      repository.find.mockResolvedValue([mockAvailability]);

      const result = await service.getAvailabilities();

      expect(result).toEqual([mockAvailability]);
      expect(repository.find).toHaveBeenCalledWith({
        where: {},
        relations: ['employee'],
        order: { date: 'DESC' },
      });
    });

    it('should filter by employeeId', async () => {
      repository.find.mockResolvedValue([mockAvailability]);

      const result = await service.getAvailabilities('emp-1');

      expect(result).toEqual([mockAvailability]);
      expect(repository.find).toHaveBeenCalledWith({
        where: { employeeId: 'emp-1' },
        relations: ['employee'],
        order: { date: 'DESC' },
      });
    });

    it('should filter by date range', async () => {
      repository.find.mockResolvedValue([mockAvailability]);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const result = await service.getAvailabilities(
        undefined,
        startDate,
        endDate,
      );

      expect(result).toEqual([mockAvailability]);
      expect(repository.find).toHaveBeenCalled();
    });

    it('should filter by start date only', async () => {
      repository.find.mockResolvedValue([mockAvailability]);

      const startDate = new Date('2024-01-01');

      const result = await service.getAvailabilities(undefined, startDate);

      expect(result).toEqual([mockAvailability]);
      expect(repository.find).toHaveBeenCalled();
    });

    it('should filter by end date only', async () => {
      repository.find.mockResolvedValue([mockAvailability]);

      const endDate = new Date('2024-01-31');

      const result = await service.getAvailabilities(
        undefined,
        undefined,
        endDate,
      );

      expect(result).toEqual([mockAvailability]);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  // ------------------
  // getAvailabilitiesByEmployeeIds
  // ------------------
  describe('getAvailabilitiesByEmployeeIds', () => {
    it('should return availabilities for multiple employees', async () => {
      repository.find.mockResolvedValue([mockAvailability]);

      const result = await service.getAvailabilitiesByEmployeeIds([
        'emp-1',
        'emp-2',
      ]);

      expect(result).toEqual([mockAvailability]);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  // ------------------
  // setAvailability
  // ------------------
  describe('setAvailability', () => {
    const setInput = {
      employeeId: 'emp-1',
      date: '2024-02-01',
      capacityHours: 6,
      note: 'Half day',
    };

    it('should create a new availability', async () => {
      (employeeService.findOne as jest.Mock).mockResolvedValue(mockEmployee);
      (absenceService.hasApprovedAbsenceOnDate as jest.Mock).mockResolvedValue(
        false,
      );
      repository.findOne.mockResolvedValueOnce(null);
      repository.create.mockReturnValue(mockAvailability);
      repository.save.mockResolvedValue(mockAvailability);
      repository.findOne.mockResolvedValueOnce(mockAvailability);

      const result = await service.setAvailability(setInput);

      expect(result).toEqual(mockAvailability);
      expect(employeeService.findOne).toHaveBeenCalledWith('emp-1');
      expect(absenceService.hasApprovedAbsenceOnDate).toHaveBeenCalledWith(
        'emp-1',
        '2024-02-01',
      );
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(dataSource.transaction).toHaveBeenCalled();
    });

    it('should update existing availability', async () => {
      const existingAvailability = { ...mockAvailability };
      const updatedAvailability = {
        ...mockAvailability,
        capacityHours: 6,
        note: 'Half day',
      };

      (employeeService.findOne as jest.Mock).mockResolvedValue(mockEmployee);
      (absenceService.hasApprovedAbsenceOnDate as jest.Mock).mockResolvedValue(
        false,
      );
      repository.findOne.mockResolvedValueOnce(existingAvailability);
      repository.save.mockResolvedValue(updatedAvailability);
      repository.findOne.mockResolvedValueOnce(updatedAvailability);

      const result = await service.setAvailability(setInput);

      expect(result.capacityHours).toBe(6);
      expect(result.note).toBe('Half day');
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          capacityHours: 6,
          note: 'Half day',
        }),
      );
      expect(dataSource.transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException if employee has approved absence on date', async () => {
      (employeeService.findOne as jest.Mock).mockResolvedValue(mockEmployee);
      (absenceService.hasApprovedAbsenceOnDate as jest.Mock).mockResolvedValue(
        true,
      );

      await expect(service.setAvailability(setInput)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.setAvailability(setInput)).rejects.toThrow(
        /Conflict with absence/,
      );
      expect(dataSource.transaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException if employee does not exist', async () => {
      (employeeService.findOne as jest.Mock).mockRejectedValue(
        new NotFoundException('Employee not found'),
      );

      await expect(service.setAvailability(setInput)).rejects.toThrow(
        NotFoundException,
      );
      expect(dataSource.transaction).toHaveBeenCalled();
    });
  });

  // ------------------
  // deleteAvailability
  // ------------------
  describe('deleteAvailability', () => {
    it('should successfully delete an availability', async () => {
      const deleteResult: DeleteResult = {
        affected: 1,
        raw: {},
      };
      repository.delete.mockResolvedValue(deleteResult);

      const result = await service.deleteAvailability('avail-1');

      expect(result).toBe(true);
      expect(repository.delete).toHaveBeenCalledWith({ id: 'avail-1' });
    });

    it('should throw NotFoundException if availability does not exist', async () => {
      const deleteResult: DeleteResult = {
        affected: 0,
        raw: {},
      };
      repository.delete.mockResolvedValue(deleteResult);

      await expect(service.deleteAvailability('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
