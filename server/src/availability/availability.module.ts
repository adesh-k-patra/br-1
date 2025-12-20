import { Module } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { AvailabilityResolver } from './availability.resolver';
import { EmployeeModule } from 'src/employee/employee.module';
import { Availability } from './availability.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [EmployeeModule, TypeOrmModule.forFeature([Availability])],
  providers: [AvailabilityService, AvailabilityResolver],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
