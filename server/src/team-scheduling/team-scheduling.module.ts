import { Module } from '@nestjs/common';
import { EmployeeModule } from './employee/employee.module';
import { AbsenceModule } from './absence/absence.module';
import { AvailabilityModule } from './availability/availability.module';
import { ScheduleModule } from './schedule/schedule.module';

@Module({
  imports: [EmployeeModule, AbsenceModule, AvailabilityModule, ScheduleModule],
  exports: [EmployeeModule, AbsenceModule, AvailabilityModule],
})
export class TeamSchedulingModule {}
