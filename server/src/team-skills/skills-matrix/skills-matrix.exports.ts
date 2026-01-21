import { SkillsMatrix } from './skills-matrix.types';

export function exportMatrixToCSV(matrix: SkillsMatrix): string {
  const { skills, employees } = matrix;

  // Header row
  const headers = ['Employee Name', ...skills.map((s) => escapeCSV(s.name))];

  const skillIndex = new Map<string, number>();
  skills.forEach((s, i) => skillIndex.set(s.id, i));

  const rows = employees.map((emp) => {
    // Initialize
    const levels = Array(skills.length).fill('');

    for (const cell of emp.skills) {
      const idx = skillIndex.get(cell.skillId);
      if (idx !== undefined && cell.level !== undefined) {
        levels[idx] = cell.level.toString();
      }
    }

    return [escapeCSV(emp.name), ...levels];
  });

  return [headers, ...rows].map((row) => row.join(',')).join('\n');
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
