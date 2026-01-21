import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeSkill } from './employee-skill.entity';
import { EmployeeSkillService } from './employee-skill.service';
import { EmployeeSkillResolver } from './employee-skill.resolver';
import { SkillModule } from '../skill/skill.module';
import { TeamSchedulingModule } from 'src/team-scheduling/team-scheduling.module';
import { SkillsMatrixModule } from '../skills-matrix/skills-matrix.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmployeeSkill]),
    TeamSchedulingModule,
    forwardRef(() => SkillModule),
    forwardRef(() => SkillsMatrixModule),
  ],
  providers: [EmployeeSkillService, EmployeeSkillResolver],
  exports: [EmployeeSkillService],
})
export class EmployeeSkillModule {}
