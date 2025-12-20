import { Module } from '@nestjs/common';
import { AbsenceService } from './absence.service';
import { AbsenceResolver } from './absence.resolver';
import { EmployeeModule } from 'src/employee/employee.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Absence } from './absence.entity';

@Module({
  imports: [EmployeeModule, TypeOrmModule.forFeature([Absence])],
  providers: [AbsenceService, AbsenceResolver],
  exports: [AbsenceService],
})
export class AbsenceModule {}
