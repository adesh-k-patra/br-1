import { Module } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { AvailabilityResolver } from './availability.resolver';
import { EmployeeModule } from 'src/employee/employee.module';

@Module({
  imports: [EmployeeModule],
  providers: [AvailabilityService, AvailabilityResolver],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
