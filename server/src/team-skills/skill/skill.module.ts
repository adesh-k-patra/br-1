import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Skill } from './skill.entity';
import { EmployeeSkillModule } from '../employee-skill/employee-skill.module';
import { SkillService } from './skill.service';
import { SkillResolver } from './skill.resolver';
import { SkillsMatrixModule } from '../skills-matrix/skills-matrix.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Skill]),
    forwardRef(() => EmployeeSkillModule),
    forwardRef(() => SkillsMatrixModule),
  ],
  providers: [SkillService, SkillResolver],
  exports: [SkillService],
})
export class SkillModule {}
