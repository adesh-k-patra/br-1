import { TeamScheduleDay } from './schedule.types';

export function exportScheduleToCSV(schedule: TeamScheduleDay[]): string {
  if (schedule.length === 0) {
    throw new Error('No data available for the selected period');
  }

  // Header row
  const dates = schedule.map((day) => day.date);
  const headers = ['Employee Name', ...dates.map((d) => escapeCSV(d))];

  const employeeMap = new Map<string, string>();
  schedule[0].employees.forEach((emp) => {
    employeeMap.set(emp.employee.id, emp.employee.name);
  });

  // Build rows for each employee
  const rows: string[][] = [];

  for (const [employeeId, employeeName] of employeeMap.entries()) {
    const row = [escapeCSV(employeeName)];

    for (const day of schedule) {
      const empSchedule = day.employees.find(
        (e) => e.employee.id === employeeId,
      );

      if (empSchedule) {
        const cellValue = empSchedule.isAbsent
          ? 'Absent'
          : `${empSchedule.effectiveCapacityHours}h`;
        row.push(escapeCSV(cellValue));
      } else {
        row.push('');
      }
    }

    rows.push(row);
  }

  return [headers, ...rows].map((row) => row.join(',')).join('\n');
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
