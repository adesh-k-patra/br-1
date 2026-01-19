export type AbsenceType =
  | "PAID_LEAVE"
  | "SICK_LEAVE"
  | "TRAINING"
  | "UNPAID_LEAVE"
  | "RTT"
  | "OTHER"
export type AbsenceStatus = "REQUESTED" | "APPROVED" | "REJECTED"

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

export interface Absence {
  id: string
  employeeId: string
  employee?: Partial<Employee>
  type: AbsenceType
  status: AbsenceStatus
  startDate: string
  endDate: string
  comment?: string
}

export interface Availability {
  id: string
  employeeId: string
  employee?: Partial<Employee>
  date: string
  capacityHours: number
  note?: string
}

export interface TeamScheduleEmployee {
  employee: Partial<Employee>
  isAbsent: boolean
  absenceType?: AbsenceType
  capacityHours: number
  effectiveCapacityHours: number
}

export interface TeamScheduleDay {
  date: string
  employees: TeamScheduleEmployee[]
}

export interface GraphQLResponse<T> {
  data?: T
  errors?: { message: string }[]
}
