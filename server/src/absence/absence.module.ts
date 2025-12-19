import { Module } from '@nestjs/common';
import { AbsenceService } from './absence.service';
import { AbsenceResolver } from './absence.resolver';

@Module({
  providers: [AbsenceService, AbsenceResolver]
})
export class AbsenceModule {}
