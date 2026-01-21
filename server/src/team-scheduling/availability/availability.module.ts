import { Module, forwardRef } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { AvailabilityResolver } from './availability.resolver';
import { EmployeeModule } from '../employee/employee.module';
import { Availability } from './availability.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Absence } from '../absence/absence.entity';
import { AbsenceModule } from 'src/team-scheduling/absence/absence.module';

@Module({
  imports: [
    forwardRef(() => EmployeeModule),
    forwardRef(() => AbsenceModule),
    TypeOrmModule.forFeature([Availability, Absence]),
  ],
  providers: [AvailabilityService, AvailabilityResolver],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
