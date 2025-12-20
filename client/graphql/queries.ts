import gql from "graphql-tag"

export const GET_EMPLOYEES = gql`
  query GetEmployees {
    employees {
      id
      name
      email
      role
      defaultDailyCapacityHours
    }
  }
`

export const GET_EMPLOYEE = gql`
  query GetEmployee($id: ID!) {
    employee(id: $id) {
      id
      name
      role
      defaultDailyCapacityHours
      absences {
        id
        type
        status
        startDate
        endDate
        comment
      }
      availabilities {
        id
        date
        capacityHours
        note
      }
    }
  }
`

export const GET_ABSENCES = gql`
  query GetAbsences(
    $employeeId: ID
    $startDate: Date
    $endDate: Date
    $status: AbsenceStatus
  ) {
    absences(
      employeeId: $employeeId
      startDate: $startDate
      endDate: $endDate
      status: $status
    ) {
      id
      employee {
        id
        name
        role
      }
      type
      status
      startDate
      endDate
      comment
    }
  }
`
export const GET_AVAILABILITIES = gql`
  query GetAvailabilities($employeeId: ID, $startDate: Date, $endDate: Date) {
    availabilities(
      employeeId: $employeeId
      startDate: $startDate
      endDate: $endDate
    ) {
      id
      employee {
        id
        name
      }
      date
      capacityHours
      note
    }
  }
`
export const GET_TEAM_SCHEDULE = gql`
  query GetTeamSchedule($startDate: Date!, $endDate: Date!) {
    teamSchedule(startDate: $startDate, endDate: $endDate) {
      date
      employees {
        employee {
          id
          name
          role
        }
        isAbsent
        absenceType
        capacityHours
        effectiveCapacityHours
      }
    }
  }
`
