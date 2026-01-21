import { forwardRef, Module } from '@nestjs/common';
import { SkillModule } from '../skill/skill.module';
import { EmployeeSkillModule } from '../employee-skill/employee-skill.module';
import { SkillsMatrixService } from './skills-matrix.service';
import { SkillsMatrixResolver } from './skills-matrix.resolver';
import { CriticalSkillsService } from './critical-skills.service';
import { TeamSchedulingModule } from 'src/team-scheduling/team-scheduling.module';

@Module({
  imports: [
    TeamSchedulingModule,
    forwardRef(() => SkillModule),
    forwardRef(() => EmployeeSkillModule),
  ],
  providers: [SkillsMatrixService, SkillsMatrixResolver, CriticalSkillsService],
  exports: [CriticalSkillsService],
})
export class SkillsMatrixModule {}
