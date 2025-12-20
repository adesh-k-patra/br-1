import { Module } from '@nestjs/common';
import { ScheduleResolver } from './schedule.resolver';
import { ScheduleService } from './schedule.service';
import { EmployeeModule } from 'src/employee/employee.module';
import { AbsenceModule } from 'src/absence/absence.module';
import { AvailabilityModule } from 'src/availability/availability.module';

@Module({
  imports: [EmployeeModule, AbsenceModule, AvailabilityModule],
  providers: [ScheduleResolver, ScheduleService],
})
export class ScheduleModule {}
