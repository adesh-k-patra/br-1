import { Injectable } from '@nestjs/common';
import { TeamScheduleDay } from './schedule.types';
import { EmployeeService } from 'src/team-scheduling/employee/employee.service';
import { AbsenceService } from 'src/team-scheduling/absence/absence.service';
import { AvailabilityService } from 'src/team-scheduling/availability/availability.service';
import { AbsenceStatus } from 'src/team-scheduling/absence/absence.entity';
import { exportScheduleToCSV } from './schedule.exports';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly absenceService: AbsenceService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  async getTeamSchedule(
    startDate: Date,
    endDate: Date,
  ): Promise<TeamScheduleDay[]> {
    // Fetch all employees
    const employees = await this.employeeService.findAll();

    const absences = await this.absenceService.getAbsences(
      undefined,
      startDate,
      endDate,
      AbsenceStatus.APPROVED,
    );

    const availabilities = await this.availabilityService.getAvailabilities(
      undefined,
      startDate,
      endDate,
    );

    // Index absences by employee
    const absenceMap = new Map<string, typeof absences>();

    for (const absence of absences) {
      const list = absenceMap.get(absence.employeeId) ?? [];
      list.push(absence);
      absenceMap.set(absence.employeeId, list);
    }

    // Index availability by employee+date
    const availabilityMap = new Map<string, (typeof availabilities)[number]>();

    for (const availability of availabilities) {
      availabilityMap.set(
        `${availability.employeeId}_${availability.date}`,
        availability,
      );
    }

    // Build schedule day-by-day
    const teamScheduleDay: TeamScheduleDay[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= new Date(endDate)) {
      const date = currentDate.toISOString().slice(0, 10);

      const employeesForDay = employees.map((employee) => {
        const employeeAbsences = absenceMap.get(employee.id) ?? [];

        const approvedAbsence = employeeAbsences.find(
          (a) => a.startDate <= date && a.endDate >= date,
        );

        const isAbsent = Boolean(approvedAbsence);

        const availability = availabilityMap.get(`${employee.id}_${date}`);

        const capacityHours =
          availability?.capacityHours ?? employee.defaultDailyCapacityHours;

        return {
          employee,
          isAbsent,
          absenceType: approvedAbsence?.type,
          capacityHours,
          effectiveCapacityHours: isAbsent ? 0 : capacityHours,
        };
      });

      teamScheduleDay.push({
        date,
        employees: employeesForDay,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return teamScheduleDay;
  }

  async exportCSV(startDate: Date, endDate: Date): Promise<string> {
    const schedule = await this.getTeamSchedule(startDate, endDate);
    return exportScheduleToCSV(schedule);
  }
}
