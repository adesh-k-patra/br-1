export enum ComparisonOperator {
  GREATER_THAN_OR_EQUAL = "GREATER_THAN_OR_EQUAL",
  LESS_THAN_OR_EQUAL = "LESS_THAN_OR_EQUAL",
  EQUAL = "EQUAL",
}
export interface Employee {
  id: string
  name: string
  email: string
  role: string
  defaultDailyCapacityHours: number
}

export interface User {
  id: string
  email: string
  employeeId?: string
  role: string
}

export interface Skill {
  id: string
  name: string
  category: string
  description?: string
}

export interface EmployeeSkill {
  id: string
  employeeId: string
  skillId: string
  level: number
  skill?: Partial<Skill>
  employee?: Partial<Employee>
}

export interface EmployeeRow {
  id: string
  name: string
  role: string
  skills: {
    skillId: string
    level?: number
  }[]
}

export interface CriticalSkill {
  skillId: string
  skillName: string
  holderCount: number
  expertCount: number
  isCritical: boolean
}

export interface SkillsMatrix {
  skills: Skill[]
  employees: EmployeeRow[]
  criticalSkills: CriticalSkill[]
}

export interface GraphQLResponse<T> {
  data?: T
  errors?: { message: string }[]
}
