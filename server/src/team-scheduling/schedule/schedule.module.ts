import { Module } from '@nestjs/common';
import { ScheduleResolver } from './schedule.resolver';
import { ScheduleService } from './schedule.service';
import { EmployeeModule } from 'src/team-scheduling/employee/employee.module';
import { AbsenceModule } from 'src/team-scheduling/absence/absence.module';
import { AvailabilityModule } from 'src/team-scheduling/availability/availability.module';

@Module({
  imports: [EmployeeModule, AbsenceModule, AvailabilityModule],
  providers: [ScheduleResolver, ScheduleService],
})
export class ScheduleModule {}
