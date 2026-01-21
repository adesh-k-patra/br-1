/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleService } from 'src/team-scheduling/schedule/schedule.service';
import { EmployeeService } from 'src/team-scheduling/employee/employee.service';
import { AbsenceService } from 'src/team-scheduling/absence/absence.service';
import { AvailabilityService } from 'src/team-scheduling/availability/availability.service';
import { Employee } from 'src/team-scheduling/employee/employee.entity';
import {
  Absence,
  AbsenceStatus,
  AbsenceType,
} from 'src/team-scheduling/absence/absence.entity';
import { Availability } from 'src/team-scheduling/availability/availability.entity';

describe('ScheduleService', () => {
  let service: ScheduleService;
  let employeeService: EmployeeService;
  let absenceService: AbsenceService;
  let availabilityService: AvailabilityService;

  const mockEmployee1: Employee = {
    id: 'emp-1',
    name: 'John Doe',
    email: 'john@test.com',
    role: 'Developer',
    defaultDailyCapacityHours: 8,
  } as Employee;

  const mockEmployee2: Employee = {
    id: 'emp-2',
    name: 'Jane Smith',
    email: 'jane@test.com',
    role: 'Designer',
    defaultDailyCapacityHours: 8,
  } as Employee;

  const mockAbsence: Absence = {
    id: 'abs-1',
    employeeId: 'emp-1',
    employee: mockEmployee1,
    type: AbsenceType.PAID_LEAVE,
    status: AbsenceStatus.APPROVED,
    startDate: '2024-01-15',
    endDate: '2024-01-17',
    comment: 'Vacation',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAvailability: Availability = {
    id: 'avail-1',
    employeeId: 'emp-2',
    employee: mockEmployee2,
    date: '2024-01-16',
    capacityHours: 4,
    note: 'Half day',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEmployeeService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
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

  const mockAvailabilityService = {
    getAvailabilities: jest.fn(),
    getAvailabilitiesByEmployeeIds: jest.fn(),
    setAvailability: jest.fn(),
    deleteAvailability: jest.fn(),
  } as unknown as AvailabilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleService,
        {
          provide: EmployeeService,
          useValue: mockEmployeeService,
        },
        {
          provide: AbsenceService,
          useValue: mockAbsenceService,
        },
        {
          provide: AvailabilityService,
          useValue: mockAvailabilityService,
        },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
    employeeService = module.get<EmployeeService>(EmployeeService);
    absenceService = module.get<AbsenceService>(AbsenceService);
    availabilityService = module.get<AvailabilityService>(AvailabilityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ------------------
  // getTeamSchedule
  // ------------------
  describe('getTeamSchedule', () => {
    it('should return team schedule with default capacity for all employees', async () => {
      (employeeService.findAll as jest.Mock).mockResolvedValue([
        mockEmployee1,
        mockEmployee2,
      ]);
      (absenceService.getAbsences as jest.Mock).mockResolvedValue([]);
      (availabilityService.getAvailabilities as jest.Mock).mockResolvedValue(
        [],
      );

      const startDate = new Date('2024-01-15');
      const endDate = new Date('2024-01-16');

      const result = await service.getTeamSchedule(startDate, endDate);

      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2024-01-15');
      expect(result[0].employees).toHaveLength(2);
      expect(result[0].employees[0].employee).toEqual(mockEmployee1);
      expect(result[0].employees[0].isAbsent).toBe(false);
      expect(result[0].employees[0].capacityHours).toBe(8);
      expect(result[0].employees[0].effectiveCapacityHours).toBe(8);
      expect(result[1].date).toBe('2024-01-16');
    });

    it('should mark employee as absent when they have approved absence', async () => {
      (employeeService.findAll as jest.Mock).mockResolvedValue([
        mockEmployee1,
        mockEmployee2,
      ]);
      (absenceService.getAbsences as jest.Mock).mockResolvedValue([
        mockAbsence,
      ]);
      (availabilityService.getAvailabilities as jest.Mock).mockResolvedValue(
        [],
      );

      const startDate = new Date('2024-01-15');
      const endDate = new Date('2024-01-16');

      const result = await service.getTeamSchedule(startDate, endDate);

      expect(result).toHaveLength(2);

      // Check day 2024-01-15
      const emp1Day1 = result[0].employees.find(
        (e) => e.employee.id === 'emp-1',
      );
      expect(emp1Day1?.isAbsent).toBe(true);
      expect(emp1Day1?.absenceType).toBe(AbsenceType.PAID_LEAVE);
      expect(emp1Day1?.effectiveCapacityHours).toBe(0);

      // Check emp-2 is not absent
      const emp2Day1 = result[0].employees.find(
        (e) => e.employee.id === 'emp-2',
      );
      expect(emp2Day1?.isAbsent).toBe(false);
      expect(emp2Day1?.effectiveCapacityHours).toBe(8);
    });

    it('should use custom availability capacity when set', async () => {
      (employeeService.findAll as jest.Mock).mockResolvedValue([
        mockEmployee1,
        mockEmployee2,
      ]);
      (absenceService.getAbsences as jest.Mock).mockResolvedValue([]);
      (availabilityService.getAvailabilities as jest.Mock).mockResolvedValue([
        mockAvailability,
      ]);

      const startDate = new Date('2024-01-16');
      const endDate = new Date('2024-01-16');

      const result = await service.getTeamSchedule(startDate, endDate);

      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2024-01-16');

      const emp2 = result[0].employees.find((e) => e.employee.id === 'emp-2');
      expect(emp2?.capacityHours).toBe(4);
      expect(emp2?.effectiveCapacityHours).toBe(4);
    });

    it('should handle multiple days with mixed absences and availabilities', async () => {
      const multiDayAbsence: Absence = {
        ...mockAbsence,
        startDate: '2024-01-15',
        endDate: '2024-01-17',
      };

      (employeeService.findAll as jest.Mock).mockResolvedValue([
        mockEmployee1,
        mockEmployee2,
      ]);
      (absenceService.getAbsences as jest.Mock).mockResolvedValue([
        multiDayAbsence,
      ]);
      (availabilityService.getAvailabilities as jest.Mock).mockResolvedValue([
        mockAvailability,
      ]);

      const startDate = new Date('2024-01-15');
      const endDate = new Date('2024-01-17');

      const result = await service.getTeamSchedule(startDate, endDate);

      expect(result).toHaveLength(3);

      // Day 1: emp-1 absent, emp-2 normal
      expect(result[0].date).toBe('2024-01-15');
      const emp1Day1 = result[0].employees.find(
        (e) => e.employee.id === 'emp-1',
      );
      expect(emp1Day1?.isAbsent).toBe(true);

      // Day 2: emp-1 absent, emp-2 has custom availability
      expect(result[1].date).toBe('2024-01-16');
      const emp1Day2 = result[1].employees.find(
        (e) => e.employee.id === 'emp-1',
      );
      const emp2Day2 = result[1].employees.find(
        (e) => e.employee.id === 'emp-2',
      );
      expect(emp1Day2?.isAbsent).toBe(true);
      expect(emp2Day2?.capacityHours).toBe(4);
      expect(emp2Day2?.effectiveCapacityHours).toBe(4);

      // Day 3: emp-1 absent, emp-2 normal
      expect(result[2].date).toBe('2024-01-17');
      const emp1Day3 = result[2].employees.find(
        (e) => e.employee.id === 'emp-1',
      );
      expect(emp1Day3?.isAbsent).toBe(true);
    });

    it('should handle single day schedule', async () => {
      (employeeService.findAll as jest.Mock).mockResolvedValue([mockEmployee1]);
      (absenceService.getAbsences as jest.Mock).mockResolvedValue([]);
      (availabilityService.getAvailabilities as jest.Mock).mockResolvedValue(
        [],
      );

      const startDate = new Date('2024-01-15');
      const endDate = new Date('2024-01-15');

      const result = await service.getTeamSchedule(startDate, endDate);

      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2024-01-15');
      expect(result[0].employees).toHaveLength(1);
    });

    it('should handle empty employee list', async () => {
      (employeeService.findAll as jest.Mock).mockResolvedValue([]);
      (absenceService.getAbsences as jest.Mock).mockResolvedValue([]);
      (availabilityService.getAvailabilities as jest.Mock).mockResolvedValue(
        [],
      );

      const startDate = new Date('2024-01-15');
      const endDate = new Date('2024-01-16');

      const result = await service.getTeamSchedule(startDate, endDate);

      expect(result).toHaveLength(2);
      expect(result[0].employees).toHaveLength(0);
      expect(result[1].employees).toHaveLength(0);
    });

    it('should call services with correct parameters', async () => {
      (employeeService.findAll as jest.Mock).mockResolvedValue([]);
      (absenceService.getAbsences as jest.Mock).mockResolvedValue([]);
      (availabilityService.getAvailabilities as jest.Mock).mockResolvedValue(
        [],
      );

      const startDate = new Date('2024-01-15');
      const endDate = new Date('2024-01-20');

      await service.getTeamSchedule(startDate, endDate);

      expect(employeeService.findAll).toHaveBeenCalledTimes(1);
      expect(absenceService.getAbsences).toHaveBeenCalledWith(
        undefined,
        startDate,
        endDate,
        AbsenceStatus.APPROVED,
      );
      expect(availabilityService.getAvailabilities).toHaveBeenCalledWith(
        undefined,
        startDate,
        endDate,
      );
    });

    it('should set effectiveCapacityHours to 0 when employee is absent regardless of availability', async () => {
      const availabilityForAbsentEmployee: Availability = {
        ...mockAvailability,
        employeeId: 'emp-1',
        date: '2024-01-15',
        capacityHours: 6,
      };

      (employeeService.findAll as jest.Mock).mockResolvedValue([mockEmployee1]);
      (absenceService.getAbsences as jest.Mock).mockResolvedValue([
        mockAbsence,
      ]);
      (availabilityService.getAvailabilities as jest.Mock).mockResolvedValue([
        availabilityForAbsentEmployee,
      ]);

      const startDate = new Date('2024-01-15');
      const endDate = new Date('2024-01-15');

      const result = await service.getTeamSchedule(startDate, endDate);

      const emp1 = result[0].employees.find((e) => e.employee.id === 'emp-1');
      expect(emp1?.isAbsent).toBe(true);
      expect(emp1?.capacityHours).toBe(6); // Custom availability
      expect(emp1?.effectiveCapacityHours).toBe(0); // But effective is 0 due to absence
    });
  });
});
