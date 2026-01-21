import { Module } from '@nestjs/common';
import { SkillModule } from './skill/skill.module';
import { EmployeeSkillModule } from './employee-skill/employee-skill.module';
import { SkillsMatrixModule } from './skills-matrix/skills-matrix.module';

@Module({
  imports: [SkillModule, EmployeeSkillModule, SkillsMatrixModule],
})
export class TeamSkillsModule {}
