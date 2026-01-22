import { Injectable } from '@nestjs/common';
import { EmployeeService } from '../../team-scheduling/employee/employee.service';
import { SkillService } from '../skill/skill.service';
import { EmployeeSkillService } from '../employee-skill/employee-skill.service';
import { SkillsMatrix, EmployeeRow, SkillColumn } from './skills-matrix.types';
import { CriticalSkillsService } from './critical-skills.service';
import { EmployeeSkill } from '../employee-skill/employee-skill.entity';
import { MatrixFilterInput } from './skills-matrix.input';
import { exportMatrixToCSV } from './skills-matrix.exports';

@Injectable()
export class SkillsMatrixService {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly skillService: SkillService,
    private readonly employeeSkillService: EmployeeSkillService,
    private readonly criticalSkillsService: CriticalSkillsService,
  ) {}

  async buildMatrix(filters?: MatrixFilterInput): Promise<SkillsMatrix> {
    const [employees, skills, assignments] = await Promise.all([
      this.employeeService.findAll(),
      this.skillService.findAll(),
      this.employeeSkillService.findAll(),
    ]);

    // Skill Filter
    let filteredSkills = skills;

    if (filters?.category) {
      filteredSkills = filteredSkills.filter(
        (s) => s.category === filters.category,
      );
    }
    if (filters?.skillName) {
      const name = filters.skillName.toLowerCase();
      filteredSkills = filteredSkills.filter((s) =>
        s.name.toLowerCase().includes(name),
      );
    }

    // Build Skill Columns
    const skillColumns: SkillColumn[] = filteredSkills.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      archived: s.archived,
    }));

    // Build Employee Rows
    const skillIds = new Set(skillColumns.map((s) => s.id));
    const assignmentsByEmployee = new Map<string, EmployeeSkill[]>();

    for (const a of assignments) {
      if (!skillIds.has(a.skillId)) continue;

      if (!assignmentsByEmployee.has(a.employeeId)) {
        assignmentsByEmployee.set(a.employeeId, []);
      }

      assignmentsByEmployee.get(a.employeeId)!.push(a);
    }

    let employeeRows: EmployeeRow[] = employees.map((emp) => ({
      id: emp.id,
      name: emp.name,
      role: emp.role,
      skills:
        assignmentsByEmployee.get(emp.id)?.map((a) => ({
          skillId: a.skillId,
          level: a.level,
        })) ?? [],
    }));

    // Level Filter
    if (filters?.level) {
      const { op, value } = filters.level;

      const matchLevel = (level: number) => {
        if (op === '>=') return level >= value;
        if (op === '<=') return level <= value;
        return level === value;
      };

      employeeRows = employeeRows
        .map((row) => ({
          ...row,
          skills: row.skills.filter(
            (s): s is typeof s & { level: number } =>
              typeof s.level === 'number' && matchLevel(s.level),
          ),
        }))
        .filter((row) => row.skills.length > 0);
    }

    const criticalSkills = await this.criticalSkillsService.getCriticalSkills(
      skillColumns,
      assignments,
    );

    return {
      skills: skillColumns,
      employees: employeeRows,
      criticalSkills,
    };
  }

  async exportCSV(filters?: MatrixFilterInput): Promise<string> {
    const matrix = await this.buildMatrix(filters);
    return exportMatrixToCSV(matrix);
  }
}
