import gql from "graphql-tag"

export const CREATE_EMPLOYEE = gql`
  mutation CreateEmployee($input: CreateEmployeeInput!) {
    createEmployee(input: $input) {
      email
      name
      role
      defaultDailyCapacityHours
    }
  }
`

export const UPDATE_EMPLOYEE = gql`
  mutation UpdateEmployee($input: UpdateEmployeeInput!) {
    updateEmployee(input: $input) {
      id
      email
      name
      role
      defaultDailyCapacityHours
    }
  }
`

export const DELETE_EMPLOYEE = gql`
  mutation DeleteEmployee($id: ID!) {
    deleteEmployee(id: $id)
  }
`

export const RECORD_ABSENCE = gql`
  mutation RecordAbsence($input: RecordAbsenceInput!) {
    recordAbsence(input: $input) {
      id
      employee {
        id
        name
      }
      type
      status
      startDate
      endDate
      comment
    }
  }
`

export const REQUEST_ABSENCE = gql`
  mutation RequestAbsence($input: RequestAbsenceInput!) {
    requestAbsence(input: $input) {
      id
      type
      status
      startDate
      endDate
      comment
    }
  }
`

export const UPDATE_ABSENCE_STATUS = gql`
  mutation UpdateAbsenceStatus($input: UpdateAbsenceStatusInput!) {
    updateAbsenceStatus(input: $input) {
      id
      status
    }
  }
`

export const DELETE_ABSENCE = gql`
  mutation DeleteAbsence($id: ID!) {
    deleteAbsence(id: $id)
  }
`

export const SET_AVAILABILITY = gql`
  mutation SetAvailability($input: SetAvailabilityInput!) {
    setAvailability(input: $input) {
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

export const DELETE_AVAILABILITY = gql`
  mutation DeleteAvailability($id: ID!) {
    deleteAvailability(id: $id)
  }
`
