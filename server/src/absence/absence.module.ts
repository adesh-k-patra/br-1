import { Module } from '@nestjs/common';
import { AbsenceService } from './absence.service';
import { AbsenceResolver } from './absence.resolver';
import { EmployeeModule } from 'src/employee/employee.module';

@Module({
  imports: [EmployeeModule],
  providers: [AbsenceService, AbsenceResolver],
  exports: [AbsenceService],
})
export class AbsenceModule {}
